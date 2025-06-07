'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Main content component with useSearchParams
function AuthCaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Initializing authentication...');
  
  useEffect(() => {
    async function processAuth() {
      try {
        setStatus('Processing authentication response...');
        
        // Get Supabase credentials
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        // Special fallback for production
        const AUTH_FALLBACK_URL = 'https://eaennrqqtlmanbivdhqm.supabase.co';
        
        // Try window environment variables first (set in layout.tsx), then env vars, then fallback
        const url = typeof window !== 'undefined' && window.ENV_SUPABASE_URL 
          ? window.ENV_SUPABASE_URL 
          : (supabaseUrl || AUTH_FALLBACK_URL);
        
        if (!url || !supabaseAnonKey) {
          setStatus('Error: Missing Supabase credentials');
          return;
        }
        
        // Create Supabase client
        const supabase = createClient(url, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'implicit'
          }
        });
        
        // Log search params for debugging
        console.log('Auth Capture - Search params:', 
          Object.fromEntries(searchParams?.entries() || []));
        
        // Get hash fragment
        const hash = window.location.hash;
        console.log('Auth Capture - Hash fragment present:', !!hash);
        
        // Check if we have token in cookies
        const accessToken = document.cookie.match(/sb-access-token=([^;]+)/)?.[1];
        const refreshToken = document.cookie.match(/sb-refresh-token=([^;]+)/)?.[1];
        
        console.log('Auth Capture - Tokens in cookies:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
        
        // Also check auth_success cookie
        const authSuccess = document.cookie.match(/auth_success=([^;]+)/)?.[1];
        const userId = document.cookie.match(/user_id=([^;]+)/)?.[1];
        
        if (authSuccess === 'true' && userId) {
          console.log('Auth Capture - Auth success cookie found with user ID:', userId);
          setStatus('Session cookie found! Redirecting...');
          router.push('/');
          return;
        }
        
        // Attempt 1: Let Supabase automatically detect session from URL
        setStatus('Checking for session in URL...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        } else if (sessionData?.session) {
          console.log('Session found automatically:', sessionData.session.user.id);
          setStatus('Session established! Redirecting...');
          
          // Set cookies to help with auth state persistence
          document.cookie = `auth_success=true;path=/;max-age=${60 * 60};`;
          document.cookie = `user_id=${sessionData.session.user.id};path=/;max-age=${60 * 60};`;
          
          router.push('/');
          return;
        }
        
        // Attempt 2: Try setting session from cookies if available
        if (accessToken && refreshToken) {
          setStatus('Setting session from cookies...');
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error('Error setting session from cookies:', error);
            } else if (data.session) {
              console.log('Session established from cookies:', data.session.user.id);
              
              // Set cookies to help with auth state persistence
              document.cookie = `auth_success=true;path=/;max-age=${60 * 60};`;
              document.cookie = `user_id=${data.session.user.id};path=/;max-age=${60 * 60};`;
              
              setStatus('Session established! Redirecting...');
              router.push('/');
              return;
            }
          } catch (err) {
            console.error('Error in setSession:', err);
          }
        }
        
        // Attempt 3: Check for hash fragment and process manually
        if (hash && hash.includes('access_token')) {
          setStatus('Processing hash fragment...');
          try {
            // Get tokens from hash
            const hashParams = new URLSearchParams(hash.substring(1));
            const hashAccessToken = hashParams.get('access_token');
            const hashRefreshToken = hashParams.get('refresh_token');
            
            if (hashAccessToken && hashRefreshToken) {
              console.log('Found tokens in hash fragment');
              
              // Try to set session with these tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken
              });
              
              if (error) {
                console.error('Error setting session from hash tokens:', error);
              } else if (data.session) {
                console.log('Session established from hash tokens:', data.session.user.id);
                
                // Set cookies to help with auth state persistence
                document.cookie = `auth_success=true;path=/;max-age=${60 * 60};`;
                document.cookie = `user_id=${data.session.user.id};path=/;max-age=${60 * 60};`;
                
                setStatus('Session established! Redirecting...');
                router.push('/');
                return;
              }
            }
          } catch (hashErr) {
            console.error('Error processing hash fragment:', hashErr);
          }
        }
        
        // Attempt 4: Try code exchange if code is present
        const code = searchParams?.get('code');
        if (code) {
          setStatus('Processing authorization code...');
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Error exchanging code for session:', error);
            } else if (data.session) {
              console.log('Session established from code exchange:', data.session.user.id);
              
              // Set cookies to help with auth state persistence
              document.cookie = `auth_success=true;path=/;max-age=${60 * 60};`;
              document.cookie = `user_id=${data.session.user.id};path=/;max-age=${60 * 60};`;
              
              setStatus('Session established! Redirecting...');
              router.push('/');
              return;
            }
          } catch (codeErr) {
            console.error('Error in code exchange:', codeErr);
          }
        }
        
        // Attempt 5: Try sign in with provider again
        setStatus('Trying alternative authentication method...');
        try {
          // Redirect back to sign-in to try again
          setStatus('Authentication failed. Redirecting to sign-in...');
          setTimeout(() => {
            router.push('/auth/sign-in?error=' + encodeURIComponent('Unable to establish session'));
          }, 2000);
        } catch (err) {
          console.error('Error in sign-in:', err);
          setStatus('Authentication failed. Please try again.');
        }
      } catch (err) {
        console.error('Unexpected error in auth capture:', err);
        setStatus('An unexpected error occurred. Please try again.');
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 3000);
      }
    }
    
    processAuth();
  }, [router, searchParams]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md text-center">
        <h1 className="text-xl font-bold">Authentication in Progress</h1>
        <div className="animate-pulse">
          <p>{status}</p>
        </div>
      </div>
    </div>
  );
}

// Wrapper with Suspense
export default function AuthCapturePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md text-center">
          <h1 className="text-xl font-bold">Authentication in Progress</h1>
          <div className="animate-pulse">
            <p>Loading authentication handler...</p>
          </div>
        </div>
      </div>
    }>
      <AuthCaptureContent />
    </Suspense>
  );
} 