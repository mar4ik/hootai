'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AuthCapturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Initializing authentication...');
  
  useEffect(() => {
    async function processAuth() {
      try {
        setStatus('Processing authentication response...');
        
        // Get Supabase credentials
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          setStatus('Error: Missing Supabase credentials');
          return;
        }
        
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey, {
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
        
        // Attempt 1: Let Supabase automatically detect session from URL
        setStatus('Checking for session in URL...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        } else if (sessionData?.session) {
          console.log('Session found automatically:', sessionData.session.user.id);
          setStatus('Session established! Redirecting...');
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
              setStatus('Session established! Redirecting...');
              router.push('/');
              return;
            }
          } catch (err) {
            console.error('Error in setSession:', err);
          }
        }
        
        // Attempt 3: Try sign in with provider again
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