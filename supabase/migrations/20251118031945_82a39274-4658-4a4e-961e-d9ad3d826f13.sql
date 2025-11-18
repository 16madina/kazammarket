-- Modifier les fonctions webhook pour utiliser directement les URLs
-- au lieu de current_setting qui nécessite des permissions spéciales

-- Fonction pour notifier les nouveaux messages via webhook
CREATE OR REPLACE FUNCTION notify_new_message_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Appeler l'edge function via pg_net de manière asynchrone
  -- L'URL est construite directement avec l'URL du projet Supabase
  PERFORM extensions.pg_net.http_post(
    url := 'https://lczzyelucnfvkicwdbbe.supabase.co/functions/v1/notify-new-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'messages',
      'record', row_to_json(NEW),
      'schema', 'public',
      'old_record', null
    )
  );

  RETURN NEW;
END;
$$;

-- Fonction pour notifier les nouveaux avis via webhook
CREATE OR REPLACE FUNCTION notify_new_review_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM extensions.pg_net.http_post(
    url := 'https://lczzyelucnfvkicwdbbe.supabase.co/functions/v1/notify-new-review',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'reviews',
      'record', row_to_json(NEW),
      'schema', 'public',
      'old_record', null
    )
  );

  RETURN NEW;
END;
$$;

-- Fonction pour notifier les nouveaux abonnés via webhook
CREATE OR REPLACE FUNCTION notify_new_follower_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM extensions.pg_net.http_post(
    url := 'https://lczzyelucnfvkicwdbbe.supabase.co/functions/v1/notify-new-follower',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'followers',
      'record', row_to_json(NEW),
      'schema', 'public',
      'old_record', null
    )
  );

  RETURN NEW;
END;
$$;