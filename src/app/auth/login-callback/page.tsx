"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import Script from "next/script"

// Immediate redirect component that injects a script running before React hydration
function ImmediateRedirectCheck() {
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
              console.log("🔍 localStorage values:", {
                dev_mode: localStorage.getItem('dev_mode'),
                local_origin: localStorage.getItem('local_origin'),
                dev_port: localStorage.getItem('dev_port'),
                force_local_redirect: localStorage.getItem('force_local_redirect')
              });
              
              // Special case: Check if we're on the Supabase auth callback page
              const isSupabaseCallback = window.location.href.includes('eaennrqqtlmanbivdhqm.supabase.co/auth/v1/callback');
              if (isSupabaseCallback) {
                console.log("⚠️ Detected Supabase callback URL - will let it complete the auth flow");
                return; // Allow Supabase to complete its auth flow
              }
              
              // Check if this is a callback on the production site but we should be on localhost
              const isProdSite = window.location.hostname === 'www.hootai.am' || window.location.hostname === 'hootai.am';
              const isDevMode = localStorage.getItem('dev_mode') === 'true';
              const hasLocalOrigin = !!localStorage.getItem('local_origin');
              
              console.log("🔍 Checks:", { isProdSite, isDevMode, hasLocalOrigin });
              
              if (isProdSite && (isDevMode || hasLocalOrigin)) {
                console.log("⚠️ AUTH CALLBACK ON PRODUCTION SITE DETECTED - FORCING REDIRECT TO LOCALHOST");
                
                // Get local origin or fallback to localhost:3000
                const localOrigin = localStorage.getItem('local_origin') || 
                                   'http://localhost:' + (localStorage.getItem('dev_port') || '3000');
                
                // Get all search params and hash to preserve them in the redirect
                const params = window.location.search || '';
                const hash = window.location.hash || '';
                
                // Build the redirect URL with all parameters preserved
                const redirectUrl = localOrigin + '/auth/login-callback' + params + hash;
                console.log("🔄 Redirecting immediately to:", redirectUrl);
                
                // Force the redirect without checking for redirect loops
                window.location.href = redirectUrl;
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
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // CRITICAL CHECK: If we're on production but should be on localhost, redirect immediately
        if (typeof window !== 'undefined') {
          console.log("🔍 DEBUG - ContentWithParams useEffect running");
          console.log("🔍 Current hostname:", window.location.hostname);
          console.log("🔍 localStorage values:", {
            dev_mode: localStorage.getItem('dev_mode'),
            local_origin: localStorage.getItem('local_origin'),
            dev_port: localStorage.getItem('dev_port'),
            force_local_redirect: localStorage.getItem('force_local_redirect')
          });
          
          const isProdSite = window.location.hostname === 'www.hootai.am' || window.location.hostname === 'hootai.am';
          const isDevMode = localStorage.getItem('dev_mode') === 'true';
          const hasLocalOrigin = !!localStorage.getItem('local_origin');
          const localOrigin = localStorage.getItem('local_origin') || 
                             'http://localhost:' + (localStorage.getItem('dev_port') || '3000');
          
          console.log("🔍 Checks:", { isProdSite, isDevMode, hasLocalOrigin });
          
          // Check if we should redirect to localhost
          if ((isProdSite || !window.location.hostname.includes('localhost')) && 
              (isDevMode || hasLocalOrigin)) {
            console.log("⚠️ CRITICAL: Auth callback running on non-localhost in dev mode!");
            
            console.log("🔄 Redirecting to local origin:", localOrigin);
            window.location.href = `${localOrigin}/auth/login-callback${window.location.search}${window.location.hash}`;
            return; // Stop execution - we're redirecting
          }
        }
        
        // Log details for debugging
        console.log("Auth callback running - searchParams:", {
          code: searchParams?.get('code') ? 'present' : 'missing',
          hash: typeof window !== 'undefined' ? (window.location.hash ? 'present' : 'missing') : 'n/a',
          isLocal: typeof window !== 'undefined' ? 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') : 'n/a',
          origin: typeof window !== 'undefined' ? window.location.origin : 'n/a',
          devMode: typeof window !== 'undefined' ? localStorage.getItem('dev_mode') : 'n/a',
          localOrigin: typeof window !== 'undefined' ? localStorage.getItem('local_origin') : 'n/a'
        });
        
        // Create a Supabase client for handling this callback
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
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
      // Handle redirect based on environment
      if (typeof window !== 'undefined') {
        const isLocalDev = localStorage.getItem('dev_mode') === 'true';
        const localOrigin = localStorage.getItem('local_origin');
        
        // Double check we're on localhost if we should be
        const currentIsLocal = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
        
        console.log("🔍 DEBUG - handleRedirect", { 
          isLocalDev, 
          localOrigin, 
          currentIsLocal,
          hostname: window.location.hostname
        });
        
        if (isLocalDev && localOrigin) {
          // For local development, redirect to local origin
          console.log("Redirecting to local origin:", localOrigin);
          
          // Make sure we're actually on localhost, otherwise we need to redirect
          if (!currentIsLocal) {
            console.log("Currently on production but need to be on localhost - redirecting");
          }
          
          // Always explicitly use the stored local origin to prevent redirect issues
          window.location.href = `${localOrigin}/`;
          return; // Ensure we exit early
        } else if (currentIsLocal) {
          // We're on localhost but not in dev mode - still use the full origin to be safe
          console.log("On localhost, using full origin for redirect");
          window.location.href = `${window.location.origin}/`;
          return;
        } else {
          // Normal production redirect
          console.log("Redirecting to production origin:", window.location.origin);
          window.location.href = `${window.location.origin}/`;
        }
      }
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