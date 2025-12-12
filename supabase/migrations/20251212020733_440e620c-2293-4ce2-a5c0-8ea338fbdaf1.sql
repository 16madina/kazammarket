-- Create trigger function for new listing notifications
CREATE OR REPLACE FUNCTION public.trigger_notify_new_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  payload jsonb;
BEGIN
  -- Only notify for active listings with approved moderation
  IF NEW.status = 'active' AND (NEW.moderation_status IS NULL OR NEW.moderation_status = 'approved') THEN
    payload := jsonb_build_object(
      'type', 'INSERT',
      'table', 'listings',
      'schema', 'public',
      'record', jsonb_build_object(
        'id', NEW.id,
        'user_id', NEW.user_id,
        'title', NEW.title,
        'price', NEW.price,
        'currency', NEW.currency,
        'images', NEW.images,
        'location', NEW.location
      ),
      'old_record', NULL
    );
    
    PERFORM extensions.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/notify-new-listing',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
      ),
      body := payload::text
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to send new listing notification: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Create trigger on listings table for new listings
DROP TRIGGER IF EXISTS on_new_listing_notify ON public.listings;
CREATE TRIGGER on_new_listing_notify
  AFTER INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_new_listing();