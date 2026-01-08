
-- Drop existing trigger and function for referral validation
DROP TRIGGER IF EXISTS on_referral_validated ON public.referrals;
DROP FUNCTION IF EXISTS public.award_boost_card_on_referral();

-- Create new function with tiered boost card system
CREATE OR REPLACE FUNCTION public.award_boost_card_on_referral()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  card_tier TEXT;
  card_duration INTEGER;
BEGIN
  -- Only process when status changes to 'validated'
  IF NEW.status = 'validated' AND (OLD.status IS NULL OR OLD.status != 'validated') THEN
    -- Increment referral count
    UPDATE public.profiles 
    SET referral_count = COALESCE(referral_count, 0) + 1
    WHERE id = NEW.referrer_id
    RETURNING referral_count INTO current_count;
    
    -- Determine if a card should be awarded based on milestones
    -- 3 referrals = Bronze (2 days)
    -- 8 referrals = Silver (3 days)
    -- 10 referrals = Gold (7 days)
    -- 17, 24, 31, ... = Gold (7 days) - every +7 after 10
    
    IF current_count = 3 THEN
      card_tier := 'bronze';
      card_duration := 2;
    ELSIF current_count = 8 THEN
      card_tier := 'silver';
      card_duration := 3;
    ELSIF current_count >= 10 AND (current_count - 10) % 7 = 0 THEN
      card_tier := 'gold';
      card_duration := 7;
    END IF;
    
    -- Award the card if a milestone was reached
    IF card_tier IS NOT NULL THEN
      INSERT INTO public.boost_cards (user_id, duration_days, status)
      VALUES (NEW.referrer_id, card_duration, 'available');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create new trigger
CREATE TRIGGER on_referral_validated
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.award_boost_card_on_referral();

-- Add tier column to boost_cards if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'boost_cards' 
                 AND column_name = 'tier') THEN
    ALTER TABLE public.boost_cards ADD COLUMN tier TEXT DEFAULT 'bronze';
  END IF;
END $$;

-- Update existing function to also store the tier
CREATE OR REPLACE FUNCTION public.award_boost_card_on_referral()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  card_tier TEXT;
  card_duration INTEGER;
BEGIN
  IF NEW.status = 'validated' AND (OLD.status IS NULL OR OLD.status != 'validated') THEN
    UPDATE public.profiles 
    SET referral_count = COALESCE(referral_count, 0) + 1
    WHERE id = NEW.referrer_id
    RETURNING referral_count INTO current_count;
    
    IF current_count = 3 THEN
      card_tier := 'bronze';
      card_duration := 2;
    ELSIF current_count = 8 THEN
      card_tier := 'silver';
      card_duration := 3;
    ELSIF current_count >= 10 AND (current_count - 10) % 7 = 0 THEN
      card_tier := 'gold';
      card_duration := 7;
    END IF;
    
    IF card_tier IS NOT NULL THEN
      INSERT INTO public.boost_cards (user_id, duration_days, status, tier)
      VALUES (NEW.referrer_id, card_duration, 'available', card_tier);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
