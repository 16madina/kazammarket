-- Update currency default based on country using a trigger
CREATE OR REPLACE FUNCTION public.set_currency_by_country()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set currency based on country
  IF NEW.country IN ('Bénin', 'Burkina Faso', 'Côte d''Ivoire', 'Guinée-Bissau', 'Mali', 'Niger', 'Sénégal', 'Togo') THEN
    NEW.currency := 'FCFA';
  ELSIF NEW.country = 'Ghana' THEN
    NEW.currency := 'GHS';
  ELSIF NEW.country = 'Nigeria' THEN
    NEW.currency := 'NGN';
  ELSIF NEW.country = 'Gambie' THEN
    NEW.currency := 'GMD';
  ELSIF NEW.country = 'Guinée' THEN
    NEW.currency := 'GNF';
  ELSIF NEW.country = 'Liberia' THEN
    NEW.currency := 'LRD';
  ELSIF NEW.country = 'Sierra Leone' THEN
    NEW.currency := 'SLL';
  ELSIF NEW.country = 'Cap-Vert' THEN
    NEW.currency := 'CVE';
  ELSIF NEW.country = 'Mauritanie' THEN
    NEW.currency := 'MRU';
  ELSE
    NEW.currency := 'FCFA'; -- Default
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profiles
CREATE TRIGGER set_currency_on_profile_create
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_currency_by_country();

-- Create trigger for profile updates (when country changes)
CREATE TRIGGER set_currency_on_country_update
BEFORE UPDATE OF country ON public.profiles
FOR EACH ROW
WHEN (OLD.country IS DISTINCT FROM NEW.country)
EXECUTE FUNCTION public.set_currency_by_country();