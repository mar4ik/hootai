-- Migration: Create a stored procedure for creating user profiles
-- This function bypasses RLS and allows the application to create profiles for users

-- Create function to create user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id UUID, current_timestamp TIMESTAMPTZ)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, bio, avatar_url, last_sign_in, updated_at)
  VALUES (
    user_id, 
    NULL, 
    NULL, 
    NULL, 
    current_timestamp,
    current_timestamp
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TIMESTAMPTZ) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_user_profile IS 'Creates a user profile, bypassing RLS policies. Used for initial profile creation.'; 