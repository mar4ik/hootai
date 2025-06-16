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
              
              // Check if this is a callback on the production site but we should be on localhost
              const isProdSite = window.location.hostname === 'www.hootai.am' || window.location.hostname === 'hootai.am';
              const isDevMode = localStorage.getItem('dev_mode') === 'true';
              const hasLocalOrigin = !!localStorage.getItem('local_origin');
              
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
  );
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
          const isProdSite = window.location.hostname === 'www.hootai.am' || window.location.hostname === 'hootai.am';
          const isDevMode = localStorage.getItem('dev_mode') === 'true';
          const hasLocalOrigin = !!localStorage.getItem('local_origin');
          
          if (isProdSite && (isDevMode || hasLocalOrigin)) {
            console.log("⚠️ CRITICAL: Auth callback running on production in dev mode!");
            const localOrigin = localStorage.getItem('local_origin') || 
                               'http://localhost:' + (localStorage.getItem('dev_port') || '3000');
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
        } else {
          // Normal production redirect
          console.log("Redirecting to production origin:", window.location.origin);
          window.location.href = `${window.location.origin}/`;
        }
      }
    }
    
    handleCallback()
  }, [searchParams])
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication</h1>
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Completing your sign-in...</p>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="bg-green-50 p-4 rounded-md mb-4">
                <p className="text-green-700 font-medium">Successfully signed in!</p>
                <p className="text-sm text-green-600 mt-2">
                  Redirecting you...
                </p>
              </div>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <p className="text-red-700 font-medium">Authentication failed</p>
                {errorMessage && (
                  <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
                )}
              </div>
              <div className="flex justify-center space-x-4">
                <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
                  Try again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
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