"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { isDevelopment, getSiteUrl, SUPABASE_CONFIG } from "@/lib/env-config"

// Immediate redirect component that injects a script running before React hydration
function ImmediateRedirectCheck() {
  return (
    <script 
      id="immediate-redirect-check"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // EMERGENCY REDIRECT FOR DEV MODE
              // If on production but should be on localhost, redirect immediately
              
              // Get the current hostname and check if it's localhost
              const hostname = window.location.hostname;
              const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
              
              // Get local origin from localStorage or construct it
              const localOrigin = localStorage.getItem('local_origin') || 
                                 'http://localhost:' + (localStorage.getItem('dev_port') || '3000');
              
              // CRITICAL CHECK: If we're on Supabase's domain, we need to let the auth flow complete
              if (window.location.href.includes('supabase.co/auth/v1/callback')) {
                return; // Allow Supabase to complete its auth flow
              }
              
              // CRITICAL CHECK: If we're on production but have any indication we should be on localhost
              if (!isLocalhost && (localStorage.getItem('dev_mode') === 'true' || 
                                  localStorage.getItem('force_local_redirect') === 'true')) {
                
                // Get all search params and hash to preserve them in the redirect
                const params = window.location.search || '';
                const hash = window.location.hash || '';
                
                // Build the redirect URL with all parameters preserved
                const redirectUrl = localOrigin + '/auth/login-callback' + params + hash;
                
                // Force the redirect without checking for redirect loops
                window.location.href = redirectUrl;
                return;
              }
            } catch (e) {
              console.error('Error in immediate redirect check:', e);
            }
          })();
        `
      }}
    />
  )
}

// ContentWrapper component that properly handles params
function ContentWithParams() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // CRITICAL CHECK: If we're on production but should be on localhost, redirect immediately
        if (typeof window !== 'undefined') {
          // ULTRA AGGRESSIVE REDIRECT DETECTION
          // If we have any indication this should be on localhost but isn't, redirect immediately
          const isLocalhost = isDevelopment();
          const isDevMode = localStorage.getItem('dev_mode') === 'true';
          const hasLocalOrigin = !!localStorage.getItem('local_origin');
          const localOrigin = localStorage.getItem('local_origin') || 
                             'http://localhost:' + (localStorage.getItem('dev_port') || '3000');
          
          // If we're not on localhost but we have any indication we should be, redirect
          if (!isLocalhost && (isDevMode || hasLocalOrigin)) {
            // Force the redirect with all parameters preserved
            const redirectUrl = `${localOrigin}/auth/login-callback${window.location.search}${window.location.hash}`;
            
            window.location.href = redirectUrl;
            return; // Stop execution - we're redirecting
          }
        }
        
        // Create a Supabase client for handling this callback
        const supabaseUrl = SUPABASE_CONFIG.url;
        const supabaseKey = SUPABASE_CONFIG.anonKey;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Missing Supabase configuration")
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        })
        
        // Get parameters from URL
        const code = searchParams?.get('code')
        const accessToken = searchParams?.get('access_token')
        const hash = typeof window !== 'undefined' ? window.location.hash : ''
        
        // If we have auth parameters, exchange them for a session
        if (hash || code || accessToken) {
          // Exchange the token
          await supabase.auth.getSession()
          
          // Save flags for returning to analysis if needed
          if (typeof window !== 'undefined') {
            const returnTo = localStorage.getItem('auth_return_to');
            if (returnTo === 'analysis') {
              // Set flag to preserve analysis state after redirect
              localStorage.setItem('preserve_analysis', 'true');
              // Create a timestamp to help with debugging
              localStorage.setItem('login_timestamp', Date.now().toString());
              // Clear the return_to flag
              localStorage.removeItem('auth_return_to');
            }
          }
          
          // Redirect immediately
          const siteUrl = getSiteUrl();
          window.location.href = siteUrl;
        } else {
          // No auth parameters, redirect to sign-in
          window.location.href = '/auth/sign-in';
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        // Redirect to sign-in with error
        window.location.href = '/auth/sign-in?error=' + encodeURIComponent("Authentication failed");
      }
    }
    
    handleCallback()
  }, [searchParams])

  // Return minimal loading indicator that will only show briefly
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin"></div>
    </div>
  )
}

// Main page component with Suspense
export default function AuthLoginCallbackPage() {
  return (
    <>
      <ImmediateRedirectCheck />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <ContentWithParams />
      </Suspense>
    </>
  )
} 