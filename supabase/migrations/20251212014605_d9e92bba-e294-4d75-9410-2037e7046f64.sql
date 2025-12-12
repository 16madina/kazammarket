-- Enable necessary extensions if not already
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to call edge function for new messages
CREATE OR REPLACE FUNCTION public.trigger_notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'messages',
    'schema', 'public',
    'record', row_to_json(NEW),
    'old_record', NULL
  );
  
  PERFORM extensions.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/notify-new-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
    ),
    body := payload::text
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Failed to send message notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Function to call edge function for new favorites
CREATE OR REPLACE FUNCTION public.trigger_notify_new_favorite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'favorites',
    'schema', 'public',
    'record', row_to_json(NEW),
    'old_record', NULL
  );
  
  PERFORM extensions.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/notify-new-favorite',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
    ),
    body := payload::text
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to send favorite notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Function to call edge function for new followers
CREATE OR REPLACE FUNCTION public.trigger_notify_new_follower()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'followers',
    'schema', 'public',
    'record', row_to_json(NEW),
    'old_record', NULL
  );
  
  PERFORM extensions.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/notify-new-follower',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
    ),
    body := payload::text
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to send follower notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Function to call edge function for new reviews
CREATE OR REPLACE FUNCTION public.trigger_notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'reviews',
    'schema', 'public',
    'record', row_to_json(NEW),
    'old_record', NULL
  );
  
  PERFORM extensions.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/notify-new-review',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
    ),
    body := payload::text
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to send review notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Function to call edge function for price offers (INSERT and UPDATE)
CREATE OR REPLACE FUNCTION public.trigger_notify_price_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    event_type := 'INSERT';
  ELSE
    event_type := 'UPDATE';
  END IF;
  
  payload := jsonb_build_object(
    'type', event_type,
    'table', 'price_offers',
    'schema', 'public',
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
  );
  
  PERFORM extensions.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/notify-price-offer',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
    ),
    body := payload::text
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to send price offer notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_new_message_notify ON public.messages;
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_new_message();

DROP TRIGGER IF EXISTS on_new_favorite_notify ON public.favorites;
CREATE TRIGGER on_new_favorite_notify
  AFTER INSERT ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_new_favorite();

DROP TRIGGER IF EXISTS on_new_follower_notify ON public.followers;
CREATE TRIGGER on_new_follower_notify
  AFTER INSERT ON public.followers
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_new_follower();

DROP TRIGGER IF EXISTS on_new_review_notify ON public.reviews;
CREATE TRIGGER on_new_review_notify
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_new_review();

DROP TRIGGER IF EXISTS on_price_offer_change_notify ON public.price_offers;
CREATE TRIGGER on_price_offer_change_notify
  AFTER INSERT OR UPDATE ON public.price_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_price_offer();