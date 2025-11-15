-- Create reviews table for ratings and comments
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buyer', 'seller')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, reviewer_id)
);

-- Create transactions table for history
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add profile statistics columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS response_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_response_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_average NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for completed transactions"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.transactions
    WHERE listing_id = reviews.listing_id
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    AND status = 'completed'
  )
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Function to update profile statistics
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update reviewee's rating stats
  UPDATE public.profiles
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update stats on new review
CREATE TRIGGER update_stats_on_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_stats();

-- Function to update sales count
CREATE OR REPLACE FUNCTION public.update_sales_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.profiles
    SET total_sales = total_sales + 1
    WHERE id = NEW.seller_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update sales on transaction
CREATE TRIGGER update_sales_on_transaction
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_sales_count();