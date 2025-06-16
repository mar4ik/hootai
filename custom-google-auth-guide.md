# How to Fix Google OAuth Consent Screen for Hoot.ai

## The Problem

When users sign in with Google, they see:
> "Choose an account to continue to eaennrqqtlmanbivdhqm.supabase.co"

Instead of:
> "Choose an account to continue to hootai.am"

## The Solution

You need to set up your own Google OAuth credentials and configure Supabase to use them instead of Supabase's default credentials.

## Step 1: Create Your Own Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Set a name like "Hoot.ai Web App"
7. Add the following Authorized JavaScript origins:
   - `https://hootai.am`
   - `http://localhost:3000` (for development)
8. Add the following Authorized redirect URIs:
   - `https://eaennrqqtlmanbivdhqm.supabase.co/auth/v1/callback`
   - `https://hootai.am/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)
9. Click "Create"
10. Copy your Client ID and Client Secret

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you're using Google Workspace)
3. Fill in the required information:
   - App name: "Hoot.ai"
   - User support email: Your email
   - Developer contact information: Your email
4. Add the following scopes:
   - `email`
   - `profile`
5. Add your domain (hootai.am) to the Authorized domains
6. Add links to your privacy policy and terms of service
7. Save and continue
8. Submit for verification if needed (not required for basic email/profile scopes)

## Step 3: Configure Supabase to Use Your Google OAuth Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (eaennrqqtlmanbivdhqm)
3. Go to Authentication > Providers
4. Find Google and click "Edit"
5. Toggle "Use custom settings" to ON
6. Enter your Google Client ID and Client Secret from Step 1
7. Save changes

## Step 4: Update Your Code

Update your sign-in code to ensure it's using the correct redirect URL:

```typescript
const handleGoogleSignIn = async () => {
  try {
    setIsGoogleLoading(true)
    
    // Get the current origin for local development, or use production URL
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    // Use the appropriate redirect URL based on environment
    const redirectTo = isLocalhost 
      ? `${window.location.origin}/auth/capture`
      : `https://hootai.am/auth/capture`;
    
    console.log(`Using redirect URL: ${redirectTo}`);
    
    // Create a temporary Supabase client for sign-in
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: true,
        flowType: 'implicit',
      }
    });
    
    // Use the Supabase client to sign in with Google
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    // Error handling
  }
}
```

## Step 5: Update Environment Variables

Make sure your environment variables are correctly set:

```
# .env.local (for development)
NEXT_PUBLIC_SUPABASE_URL=https://eaennrqqtlmanbivdhqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# .env.production (for production)
NEXT_PUBLIC_SUPABASE_URL=https://eaennrqqtlmanbivdhqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://hootai.am
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Step 6: Test Your Changes

1. Clear your browser cookies and local storage
2. Try signing in with Google again
3. You should now see "Choose an account to continue to hootai.am" instead of the Supabase domain

## Why This Works

By default, Supabase uses its own Google OAuth credentials, which is why you see the Supabase domain in the consent screen. By setting up your own Google OAuth credentials and configuring Supabase to use them, you're telling Google that the OAuth request is coming from your domain (hootai.am) rather than from Supabase's domain.

## Important Notes

1. Your Google OAuth credentials must have the Supabase callback URL (`https://eaennrqqtlmanbivdhqm.supabase.co/auth/v1/callback`) as an authorized redirect URI.

2. If you're using Supabase's default Google OAuth credentials, the consent screen will always show the Supabase domain regardless of your redirectTo URL.

3. The OAuth consent screen domain is determined by the OAuth client ID, not by the redirectTo URL.

4. You may need to verify your app with Google if you plan to make it available to all users, but this isn't required for development or if you're only using basic scopes. 