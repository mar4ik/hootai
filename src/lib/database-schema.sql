-- Supabase Database Schema

-- Note: Supabase automatically creates an 'auth.users' table with basic authentication info
-- This schema extends the built-in auth system with additional user data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  last_sign_in TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS (Row Level Security) policies to protect user data
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, last_sign_in)
  VALUES (NEW.id, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- For existing tables, add the last_sign_in column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'last_sign_in'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN last_sign_in TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Update Database Schema Type
COMMENT ON TABLE public.user_profiles IS 'Stores additional user profile information'; 