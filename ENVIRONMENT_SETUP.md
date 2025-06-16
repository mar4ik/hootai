# Environment Setup for Authentication

This guide explains how to set up environment variables for proper authentication in both development and production environments.

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site URL - used for authentication callbacks
# In development: http://localhost:3000 (or your local development URL)
# In production: https://www.hootai.am
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Project Configuration

For Google OAuth to work correctly in both development and production, you need to configure your Supabase project properly:

1. Go to your Supabase dashboard
2. Navigate to Authentication → URL Configuration
3. Set the Site URL to your production URL (e.g., `https://www.hootai.am`)
4. Add the following Redirect URLs:
   - `http://localhost:3000/auth/login-callback` (for local development)
   - `https://www.hootai.am/auth/login-callback` (for production)

## How Authentication Works

The authentication flow has been updated to be environment-aware:

1. When a user initiates Google sign-in, the application detects the current environment (development or production)
2. It stores environment information in localStorage for use during the callback
3. After authentication, the user is redirected back to the appropriate environment:
   - In development: back to localhost
   - In production: back to the production site

## Troubleshooting

If you're experiencing redirect issues:

1. Check that your Supabase project has the correct redirect URLs configured
2. Verify that your environment variables are set correctly
3. Clear localStorage and browser cookies, then try again
4. Check browser console logs for debugging information

The application includes extensive logging to help diagnose authentication issues. 