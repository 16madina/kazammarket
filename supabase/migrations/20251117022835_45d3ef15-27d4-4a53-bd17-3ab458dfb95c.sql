-- Change default moderation_status to 'approved' for auto-approval of new listings
ALTER TABLE public.listings 
ALTER COLUMN moderation_status SET DEFAULT 'approved';