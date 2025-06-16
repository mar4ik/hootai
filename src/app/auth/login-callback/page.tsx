"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import Script from "next/script"
import { isDevelopment, getSiteUrl, SUPABASE_CONFIG } from "@/lib/env-config"

// Add server-side logging
console.log("🔍 SERVER: Auth login-callback page module loaded");

// Immediate redirect component that injects a script running before React hydration
function ImmediateRedirectCheck() {
  console.log("🔍 SERVER: ImmediateRedirectCheck component rendering");
  
  return (
    <Script 
      id="immediate-redirect-check"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // EMERGENCY REDIRECT FOR DEV MODE
              // If on production but should be on localhost, redirect immediately
              
              console.log("🔍 DEBUG - ImmediateRedirectCheck running");
              console.log("🔍 Current hostname:", window.location.hostname);
              console.log("🔍 Current URL:", window.location.href);
              console.log("🔍 localStorage values:", {
                dev_mode: localStorage.getItem('dev_mode'),
                local_origin: localStorage.getItem('local_origin'),
                dev_port: localStorage.getItem('dev_port'),
                force_local_redirect: localStorage.getItem('force_local_redirect')
              });
              
              // Get the current hostname and check if it's localhost
              const hostname = window.location.hostname;
              const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
              
              // Get local origin from localStorage or construct it
              const localOrigin = localStorage.getItem('local_origin') || 
                                 'http://localhost:' + (localStorage.getItem('dev_port') || '3000');
              
              // CRITICAL CHECK: If we're on Supabase's domain, we need to let the auth flow complete
              if (window.location.href.includes('supabase.co/auth/v1/callback')) {
                console.log("⚠️ Detected Supabase callback URL - will let it complete the auth flow");
                return; // Allow Supabase to complete its auth flow
              }
              
              // CRITICAL CHECK: If we're on production but have any indication we should be on localhost
              if (!isLocalhost && (localStorage.getItem('dev_mode') === 'true' || 
                                  localStorage.getItem('force_local_redirect') === 'true')) {
                console.log("⚠️ AUTH CALLBACK ON NON-LOCALHOST DETECTED - FORCING REDIRECT TO LOCALHOST");
                
                // Get all search params and hash to preserve them in the redirect
                const params = window.location.search || '';
                const hash = window.location.hash || '';
                
                // Build the redirect URL with all parameters preserved
                const redirectUrl = localOrigin + '/auth/login-callback' + params + hash;
                console.log("🔄 Redirecting immediately to:", redirectUrl);
                
                // Force the redirect without checking for redirect loops
                window.location.href = redirectUrl;
                return;
              }
              
              console.log("✅ No immediate redirect needed");
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
  console.log("🔍 SERVER: ContentWithParams component rendering");
  
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  useEffect(() => {
    console.log("🔍 SERVER: ContentWithParams useEffect running");
    
    const handleCallback = async () => {
      try {
        // CRITICAL CHECK: If we're on production but should be on localhost, redirect immediately
        if (typeof window !== 'undefined') {
          console.log("🔍 DEBUG - ContentWithParams useEffect running");
          console.log("🔍 Current hostname:", window.location.hostname);
          console.log("🔍 Current URL:", window.location.href);
          console.log("🔍 localStorage values:", {
            dev_mode: localStorage.getItem('dev_mode'),
            local_origin: localStorage.getItem('local_origin'),
            dev_port: localStorage.getItem('dev_port'),
            force_local_redirect: localStorage.getItem('force_local_redirect')
          });
          
          // ULTRA AGGRESSIVE REDIRECT DETECTION
          // If we have any indication this should be on localhost but isn't, redirect immediately
          const isLocalhost = isDevelopment();
          const isDevMode = localStorage.getItem('dev_mode') === 'true';
          const hasLocalOrigin = !!localStorage.getItem('local_origin');
          const localOrigin = localStorage.getItem('local_origin') || 
                             'http://localhost:' + (localStorage.getItem('dev_port') || '3000');
          
          console.log("🔍 Checks:", { isDevMode, hasLocalOrigin, isLocalhost });
          
          // If we're not on localhost but we have any indication we should be, redirect
          if (!isLocalhost && (isDevMode || hasLocalOrigin)) {
            console.log("⚠️ CRITICAL: Auth callback running on non-localhost in dev mode!");
            console.log("🔄 Redirecting to local origin:", localOrigin);
            
            // Force the redirect with all parameters preserved
            const redirectUrl = `${localOrigin}/auth/login-callback${window.location.search}${window.location.hash}`;
            console.log("🔄 Redirecting to:", redirectUrl);
            
            window.location.href = redirectUrl;
            return; // Stop execution - we're redirecting
          }
        }
        
        // Log details for debugging
        console.log("Auth callback running - searchParams:", {
          code: searchParams?.get('code') ? 'present' : 'missing',
          hash: typeof window !== 'undefined' ? (window.location.hash ? 'present' : 'missing') : 'n/a',
          isLocal: isDevelopment(),
          origin: typeof window !== 'undefined' ? window.location.origin : 'n/a',
          devMode: typeof window !== 'undefined' ? localStorage.getItem('dev_mode') : 'n/a',
          localOrigin: typeof window !== 'undefined' ? localStorage.getItem('local_origin') : 'n/a'
        });
        
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
          console.log("Found auth params, exchanging for session...")
          
          // Exchange the token
          const { error: exchangeError } = await supabase.auth.getSession()
          
          if (exchangeError) {
            throw new Error(`Failed to exchange session: ${exchangeError.message}`)
          }
          
          // Success - now handle redirect
          setStatus("success")
          
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
              console.log("Setting preserve_analysis flag for returning to analysis");
            }
          }
          
          // Redirect immediately
          handleRedirect();
        } else {
          throw new Error("No authentication parameters found in URL")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Unknown error")
      }
    }
    
    const handleRedirect = () => {
      // Get the appropriate site URL based on environment
      const siteUrl = getSiteUrl();
      console.log("🔍 Redirecting to site URL:", siteUrl);
      window.location.href = siteUrl;
    }
    
    handleCallback()
  }, [searchParams])

  // Render loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Processing login...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication</p>
      </div>
    )
  }

  // Render error state
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="p-3 bg-red-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-4">{errorMessage || "Failed to authenticate. Please try again."}</p>
        <div className="flex gap-4">
          <Link href="/auth/sign-in" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Try Again
          </Link>
          <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // Render success state (though this should redirect automatically)
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="p-3 bg-green-100 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Authentication Successful!</h2>
      <p className="text-gray-600 mb-4">You are now signed in. Redirecting...</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Continue to Home
      </Link>
    </div>
  )
}

// Wrapper component with Suspense
export default function AuthLoginCallbackPage() {
  console.log("🔍 SERVER: AuthLoginCallbackPage component rendering");
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we complete your authentication</p>
        </div>
      </div>
    }>
      <ImmediateRedirectCheck />
      <ContentWithParams />
    </Suspense>
  )
} 