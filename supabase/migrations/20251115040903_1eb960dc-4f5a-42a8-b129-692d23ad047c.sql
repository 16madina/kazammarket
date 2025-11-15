-- Add presence tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS typing_in_conversation uuid;

-- Add message types and media support
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location', 'price_offer')),
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS location_lat decimal,
ADD COLUMN IF NOT EXISTS location_lng decimal,
ADD COLUMN IF NOT EXISTS location_name text;

-- Create price offers table
CREATE TABLE IF NOT EXISTS public.price_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'counter')),
  message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on price_offers
ALTER TABLE public.price_offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for price_offers
CREATE POLICY "Users can view their own offers"
ON public.price_offers FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create offers"
ON public.price_offers FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received offers"
ON public.price_offers FOR UPDATE
USING (auth.uid() = receiver_id);

-- Create blocked users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_users
CREATE POLICY "Users can view their own blocks"
ON public.blocked_users FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
ON public.blocked_users FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their blocks"
ON public.blocked_users FOR DELETE
USING (auth.uid() = blocker_id);

-- Create quick replies table
CREATE TABLE IF NOT EXISTS public.quick_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on quick_replies
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for quick_replies
CREATE POLICY "Users can manage their own quick replies"
ON public.quick_replies FOR ALL
USING (auth.uid() = user_id);

-- Function to create default quick replies for new users
CREATE OR REPLACE FUNCTION public.create_default_quick_replies()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.quick_replies (user_id, message, order_index) VALUES
    (NEW.id, 'Bonjour, est-ce toujours disponible ?', 1),
    (NEW.id, 'Quel est votre meilleur prix ?', 2),
    (NEW.id, 'Merci, je suis intéressé(e)', 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create default quick replies for new users
DROP TRIGGER IF EXISTS on_profile_created_quick_replies ON public.profiles;
CREATE TRIGGER on_profile_created_quick_replies
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_quick_replies();

-- Enable realtime for price_offers
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_offers;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_price_offers_conversation_id ON public.price_offers(conversation_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON public.profiles(is_online);