# Supabase OAuth Configuration Guide

## The Problem
When signing in with Google, you're seeing:
- "Choose an account to continue to eaennrqqtlmanbivdhqm.supabase.co"
- Being redirected to production from localhost

## How to Fix It

### 1. Configure Supabase Auth Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (eaennrqqtlmanbivdhqm)
3. Go to Authentication → URL Configuration
4. Add the following Site URLs:
   - `https://www.hootai.am` (production)
   - `http://localhost:3000` (development)
5. Add the following Redirect URLs:
   - `https://www.hootai.am/auth/capture`
   - `http://localhost:3000/auth/capture`
6. Click "Save"

### 2. Configure Google OAuth Provider in Supabase

1. In Supabase Dashboard, go to Authentication → Providers
2. Find Google and click "Edit"
3. Make sure the following settings are correct:
   - Client ID: Your Google Client ID
   - Secret: Your Google Client Secret
   - Authorized JavaScript origins:
     - `https://www.hootai.am`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `https://eaennrqqtlmanbivdhqm.supabase.co/auth/v1/callback`
4. Click "Save"

### 3. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to APIs & Services → Credentials
4. Edit your OAuth 2.0 Client ID
5. Add the following Authorized JavaScript origins:
   - `https://www.hootai.am`
   - `http://localhost:3000`
   - `https://eaennrqqtlmanbivdhqm.supabase.co`
6. Add the following Authorized redirect URIs:
   - `https://www.hootai.am/auth/capture`
   - `http://localhost:3000/auth/capture`
   - `https://eaennrqqtlmanbivdhqm.supabase.co/auth/v1/callback`
7. Click "Save"

### 4. Configure OAuth Consent Screen

1. In Google Cloud Console, go to APIs & Services → OAuth consent screen
2. Under "App information", set:
   - App name: "Hoot.ai"
   - User support email: Your email
   - App logo: Upload your logo
3. Under "App domain", add:
   - Homepage link: `https://www.hootai.am`
   - Privacy policy link: `https://www.hootai.am/privacy`
   - Terms of service link: `https://www.hootai.am/terms`
4. Click "Save"

## Why This Happens

The issue occurs because:

1. Supabase handles OAuth through their domain (eaennrqqtlmanbivdhqm.supabase.co)
2. Google shows this domain in the consent screen because it's the registered OAuth client
3. After authentication, Supabase needs to know where to redirect the user (your app)

By properly configuring the Site URLs and Redirect URLs in both Supabase and Google Cloud Console, you ensure that:

1. The authentication flow starts from your domain (localhost or production)
2. Passes through Supabase for authentication
3. Returns correctly to your domain after authentication

## Testing the Fix

After making these changes:

1. Clear your browser cookies and local storage
2. Restart your Next.js development server
3. Try signing in with Google again

You should now see a cleaner OAuth flow and be properly redirected back to your application (localhost during development). 