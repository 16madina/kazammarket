
-- Update the handle_new_user function to copy all user data including city and country
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    first_name, 
    last_name, 
    phone, 
    avatar_url, 
    city, 
    country
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'country'
  );
  RETURN new;
END;
$$;
