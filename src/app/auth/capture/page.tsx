'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Main content component with useSearchParams
function AuthCaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Initializing authentication...');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  // Add debug info to state without logging to console
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, info]);
  };
  
  useEffect(() => {
    async function processAuth() {
      try {
        setStatus('Processing authentication response...');
        
        // Debug environment
        const isLocal = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        addDebugInfo(`Environment: ${isLocal ? 'localhost' : 'production'}`);
        addDebugInfo(`Current origin: ${window.location.origin}`);
        
        // Get Supabase credentials
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        // Special fallback for production
        const AUTH_FALLBACK_URL = 'https://eaennrqqtlmanbivdhqm.supabase.co';
        
        // Try window environment variables first (set in layout.tsx), then env vars, then fallback
        const url = typeof window !== 'undefined' && (window as any).ENV_SUPABASE_URL 
          ? (window as any).ENV_SUPABASE_URL 
          : (supabaseUrl || AUTH_FALLBACK_URL);
        
        addDebugInfo(`Using Supabase URL: ${url}`);
        
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
        
        // Check for access_token in query params (implicit flow)
        const accessToken = searchParams?.get('access_token');
        const refreshToken = searchParams?.get('refresh_token');
        
        if (accessToken && refreshToken) {
          addDebugInfo('Found access_token and refresh_token in query params');
          setStatus('Processing access token...');
          try {
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error('Error setting session from tokens:', error);
              addDebugInfo(`Error setting session: ${error.message}`);
              throw error;
            } else if (data.session) {
              // Set cookies to help with auth state persistence
              document.cookie = `auth_success=true;path=/;max-age=${60 * 60};`;
              document.cookie = `user_id=${data.session.user.id};path=/;max-age=${60 * 60};`;
              
              addDebugInfo(`Session established for user: ${data.session.user.email}`);
              setStatus('Session established! Redirecting...');
              
              // CRITICAL: Always redirect to the current origin
              const currentOrigin = window.location.origin;
              addDebugInfo(`Redirecting to: ${currentOrigin}/`);
              window.location.href = `${currentOrigin}/`;
              return;
            }
          } catch (tokenErr) {
            console.error('Error processing tokens:', tokenErr);
            throw tokenErr;
          }
        }
        
        // Get hash fragment
        const hash = window.location.hash;
        if (hash) {
          addDebugInfo(`Found hash fragment: ${hash.substring(0, 20)}...`);
        }
        
        // Check for code parameter (fallback for PKCE flow)
        const code = searchParams?.get('code');
        if (code) {
          addDebugInfo('Found code parameter (PKCE flow)');
          setStatus('Processing authorization code...');
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Error exchanging code for session:', error);
              addDebugInfo(`Error exchanging code: ${error.message}`);
              throw error;
            } else if (data.session) {
              // Set cookies to help with auth state persistence
              document.cookie = `auth_success=true;path=/;max-age=${60 * 60};`;
              document.cookie = `user_id=${data.session.user.id};path=/;max-age=${60 * 60};`;
              
              addDebugInfo(`Session established for user: ${data.session.user.email}`);
              setStatus('Session established! Redirecting...');
              
              // CRITICAL: Always redirect to the current origin
              const currentOrigin = window.location.origin;
              addDebugInfo(`Redirecting to: ${currentOrigin}/`);
              window.location.href = `${currentOrigin}/`;
              return;
            }
          } catch (codeErr) {
            console.error('Error in code exchange:', codeErr);
            throw codeErr;
          }
        }
        
        // Check if we have a session already
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          addDebugInfo(`Error getting session: ${sessionError.message}`);
          throw sessionError;
        } else if (sessionData?.session) {
          // Set cookies to help with auth state persistence
          document.cookie = `auth_success=true;path=/;max-age=${60 * 60};`;
          document.cookie = `user_id=${sessionData.session.user.id};path=/;max-age=${60 * 60};`;
          
          addDebugInfo(`Existing session found for user: ${sessionData.session.user.email}`);
          setStatus('Session established! Redirecting...');
          
          // CRITICAL: Always redirect to the current origin
          const currentOrigin = window.location.origin;
          addDebugInfo(`Redirecting to: ${currentOrigin}/`);
          window.location.href = `${currentOrigin}/`;
          return;
        }
        
        // If we have a hash fragment, try to process it
        if (hash && hash.includes('access_token')) {
          addDebugInfo('Processing hash fragment with access_token');
          setStatus('Processing hash fragment...');
          try {
            // Get tokens from hash
            const hashParams = new URLSearchParams(hash.substring(1));
            const hashAccessToken = hashParams.get('access_token');
            const hashRefreshToken = hashParams.get('refresh_token');
            
            if (hashAccessToken && hashRefreshToken) {
              // Try to set session with these tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken
              });
              
              if (error) {
                console.error('Error setting session from hash tokens:', error);
                addDebugInfo(`Error setting session from hash: ${error.message}`);
                throw error;
              } else if (data.session) {
                // Set cookies to help with auth state persistence
                document.cookie = `auth_success=true;path=/;max-age=${60 * 60};`;
                document.cookie = `user_id=${data.session.user.id};path=/;max-age=${60 * 60};`;
                
                addDebugInfo(`Session established from hash for user: ${data.session.user.email}`);
                setStatus('Session established! Redirecting...');
                
                // CRITICAL: Always redirect to the current origin
                const currentOrigin = window.location.origin;
                addDebugInfo(`Redirecting to: ${currentOrigin}/`);
                window.location.href = `${currentOrigin}/`;
                return;
              }
            }
          } catch (hashErr) {
            console.error('Error processing hash fragment:', hashErr);
            throw hashErr;
          }
        }
        
        // If we get here, authentication failed
        addDebugInfo('Authentication failed - no valid session established');
        setStatus('Authentication failed. Redirecting to sign-in...');
        setTimeout(() => {
          // CRITICAL: Use current origin for error redirect
          const currentOrigin = window.location.origin;
          addDebugInfo(`Redirecting to sign-in: ${currentOrigin}/auth/sign-in`);
          window.location.href = `${currentOrigin}/auth/sign-in?error=${encodeURIComponent('Unable to establish session')}`;
        }, 2000);
      } catch (err) {
        console.error('Unexpected error in auth capture:', err);
        addDebugInfo(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setStatus('An unexpected error occurred. Please try again.');
        setTimeout(() => {
          // CRITICAL: Use current origin for error redirect
          const currentOrigin = window.location.origin;
          addDebugInfo(`Redirecting to sign-in: ${currentOrigin}/auth/sign-in`);
          window.location.href = `${currentOrigin}/auth/sign-in`;
        }, 3000);
      }
    }
    
    processAuth();
  }, [router, searchParams]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md text-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-xl font-bold">Authentication in Progress</h1>
        <div className="animate-pulse">
          <p>{status}</p>
        </div>
        
        {/* Debug information */}
        {debugInfo.length > 0 && (
          <div className="mt-8 text-left text-xs border-t pt-4">
            <p className="font-semibold mb-2">Debug Information:</p>
            <div className="bg-gray-100 p-2 rounded-md overflow-auto max-h-40">
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))}
            </div>
          </div>
        )}
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
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
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