-- Migration: Add last_sign_in column to user_profiles table
-- This migration adds a new column to track the last time a user signed in

-- Check if the column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'last_sign_in'
  ) THEN
    -- Add the last_sign_in column if it doesn't exist
    ALTER TABLE public.user_profiles ADD COLUMN last_sign_in TIMESTAMP WITH TIME ZONE;
    
    -- Add comment explaining the column
    COMMENT ON COLUMN public.user_profiles.last_sign_in IS 'Timestamp of the user''s last sign-in';
    
    RAISE NOTICE 'Added last_sign_in column to user_profiles table';
  ELSE
    RAISE NOTICE 'last_sign_in column already exists in user_profiles table';
  END IF;
END $$; 