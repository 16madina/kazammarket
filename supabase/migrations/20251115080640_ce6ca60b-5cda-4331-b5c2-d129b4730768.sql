-- Create reports table for user reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  UNIQUE(listing_id, reporter_id)
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all reports"
ON public.reports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));