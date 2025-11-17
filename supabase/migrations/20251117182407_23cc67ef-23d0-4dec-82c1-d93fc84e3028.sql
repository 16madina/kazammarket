-- Corriger la fonction handle_new_user pour récupérer TOUTES les informations de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  insert into public.profiles (
    id, 
    full_name, 
    first_name, 
    last_name, 
    phone,
    avatar_url,
    country,
    city,
    location,
    email_verified
  )
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'city',
    CONCAT(new.raw_user_meta_data->>'city', ', ', new.raw_user_meta_data->>'country'),
    false
  );
  return new;
end;
$$;