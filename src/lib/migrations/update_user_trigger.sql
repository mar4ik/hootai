-- Migration: Update handle_new_user trigger function
-- This migration updates the existing trigger function without recreating it or the trigger

-- Check if the function exists and update it to include last_sign_in
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'handle_new_user'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Drop and recreate the function with the updated code
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $FUNC$
    BEGIN
      INSERT INTO public.user_profiles (id, last_sign_in)
      VALUES (NEW.id, now());
      RETURN NEW;
    END;
    $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE 'Updated handle_new_user function to include last_sign_in field';
  ELSE
    RAISE NOTICE 'handle_new_user function does not exist, creating it';
    
    -- Create the function if it doesn't exist
    CREATE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $FUNC$
    BEGIN
      INSERT INTO public.user_profiles (id, last_sign_in)
      VALUES (NEW.id, now());
      RETURN NEW;
    END;
    $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Check if trigger exists, create it if not
    IF NOT EXISTS (
      SELECT FROM pg_trigger
      WHERE tgname = 'on_auth_user_created'
      AND tgrelid = 'auth.users'::regclass
    ) THEN
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
      
      RAISE NOTICE 'Created on_auth_user_created trigger';
    END IF;
  END IF;
END $$; 