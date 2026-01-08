
-- Create function to trigger push notification for new boost cards
CREATE OR REPLACE FUNCTION public.trigger_notify_boost_card()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_count INTEGER;
BEGIN
  -- Get the user's current referral count
  SELECT referral_count INTO v_referral_count
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Call the edge function to send push notification
  PERFORM net.http_post(
    url := 'https://lczzyelucnfvkicwdbbe.supabase.co/functions/v1/notify-boost-card',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjenp5ZWx1Y25mdmtpY3dkYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzI2MjYsImV4cCI6MjA3ODcwODYyNn0.39AH04J0GuwBYqxUOPwIjXQFcMDwseXayUhXB5uuTzM'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'boost_cards',
      'schema', 'public',
      'record', jsonb_build_object(
        'user_id', NEW.user_id,
        'tier', NEW.tier,
        'duration_days', NEW.duration_days,
        'referral_count', COALESCE(v_referral_count, 0)
      )
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to send boost card notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new boost cards
DROP TRIGGER IF EXISTS on_boost_card_created ON public.boost_cards;
CREATE TRIGGER on_boost_card_created
  AFTER INSERT ON public.boost_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_boost_card();
