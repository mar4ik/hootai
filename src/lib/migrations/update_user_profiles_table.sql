-- Migration: Update user_profiles table
-- This migration only adds columns to the user_profiles table without recreating existing policies

-- Check if the table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
  ) THEN
    -- Add the last_sign_in column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_profiles' 
      AND column_name = 'last_sign_in'
    ) THEN
      ALTER TABLE public.user_profiles ADD COLUMN last_sign_in TIMESTAMP WITH TIME ZONE;
      RAISE NOTICE 'Added last_sign_in column to user_profiles table';
    ELSE
      RAISE NOTICE 'last_sign_in column already exists';
    END IF;
    
    -- Update existing user records to set an initial last_sign_in value if null
    UPDATE public.user_profiles
    SET last_sign_in = updated_at
    WHERE last_sign_in IS NULL;
    
    RAISE NOTICE 'Updated null last_sign_in values to match updated_at timestamp';
    
  ELSE
    RAISE EXCEPTION 'user_profiles table does not exist!';
  END IF;
END $$; 