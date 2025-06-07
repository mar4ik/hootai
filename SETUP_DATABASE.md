# Setting Up Your Supabase Database

This guide provides step-by-step instructions on how to set up your Supabase database for this application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com) if you don't have one)
2. A Supabase project created

## Steps to Set Up the Database

### 1. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Project Settings > API
4. Note down:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Update Your Environment Variables

1. Open your `.env.local` file in the root of your project
2. Update the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Apply the Database Schema

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of the file below into the SQL editor:

```sql
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
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update Database Schema Type
COMMENT ON TABLE public.user_profiles IS 'Stores additional user profile information';
```

6. Click "Run" to execute the SQL

### 4. Verify the Setup

1. In your Supabase Dashboard, click on "Table Editor" in the left sidebar
2. You should see a table called "user_profiles"
3. Click on the table and check that it has columns for:
   - id (UUID)
   - display_name (varchar)
   - bio (text)
   - avatar_url (text)
   - preferences (jsonb)
   - created_at (timestamp with time zone)
   - updated_at (timestamp with time zone)

### 5. Create Profiles for Existing Users (If Needed)

If you already had users in your system before setting up this table, you'll need to manually create profiles for them:

1. Go to "SQL Editor" in the Supabase Dashboard
2. Create a new query
3. For each existing user, run:
   ```sql
   INSERT INTO public.user_profiles (id)
   VALUES ('user-id-here');
   ```
   Replace 'user-id-here' with the actual user ID.

### 6. Test the Connection

1. Restart your application:
   ```bash
   npm run dev
   ```
2. Go to http://localhost:3000/test-db
3. Click "Test Database Connection" to verify that you can connect to Supabase
4. If you're signed in, click "Test User Profile" to verify that the user_profiles table is working

## Troubleshooting

### Connection Issues

- Double-check your environment variables in `.env.local`
- Make sure you're using the correct URL and anon key (not the service_role key for client-side code)
- Check that your IP is allowed in Supabase (Project Settings > API > JWT Settings)

### Profile Not Found

- Verify that the user_profiles table exists
- Check if a profile was created for your user ID
- Try manually inserting a profile for your user ID

### RLS (Row Level Security) Issues

- Verify that the RLS policies were created
- Make sure you're authenticated when trying to access user profiles
- Check if auth.uid() returns the expected value 