-- Supprimer les triggers webhook défectueux avec leurs vrais noms
DROP TRIGGER IF EXISTS trigger_notify_new_message_webhook ON public.messages;
DROP TRIGGER IF EXISTS trigger_notify_new_review_webhook ON public.reviews;
DROP TRIGGER IF EXISTS trigger_notify_new_follower_webhook ON public.followers;

-- Supprimer les fonctions webhook défectueuses
DROP FUNCTION IF EXISTS public.notify_new_message_webhook() CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_review_webhook() CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_follower_webhook() CASCADE;

-- S'assurer que les triggers directs (qui fonctionnent) sont actifs
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_review();

DROP TRIGGER IF EXISTS on_follower_created ON public.followers;
CREATE TRIGGER on_follower_created
  AFTER INSERT ON public.followers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_follower();