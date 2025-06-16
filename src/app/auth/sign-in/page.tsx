"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getAuthCallbackUrl, storeEnvironmentInfo, SUPABASE_CONFIG } from "@/lib/env-config"
import { createClient } from "@supabase/supabase-js"

// Component to handle URL params - isolated to ensure proper Suspense boundary
function ParamsHandler({ onParamsReady }: { 
  onParamsReady: (returnTo: string | null, error: string | null) => void 
}) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const returnTo = searchParams?.get('return_to')
    const error = searchParams?.get('error')
    onParamsReady(returnTo, error)
  }, [searchParams, onParamsReady])
  
  return null
}

// Main sign-in component
function SignInContent() {
  
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [returnTo, setReturnTo] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  // Only show on client side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-hide success message after a few seconds
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle params from URL
  const handleParamsReady = (returnTo: string | null, error: string | null) => {
    if (returnTo) setReturnTo(returnTo)
    if (error) setUrlError(error)
  }

  // Define handleRedirectAfterAuth with useCallback to avoid dependency issues
  const handleRedirectAfterAuth = useCallback((_userId: string) => {
    // Check if we have a return_to parameter
    if (returnTo === 'analysis') {
      // Set the preservation flag
      localStorage.setItem('preserve_analysis', 'true')
      
      // Create a timestamp to help with debugging
      localStorage.setItem('login_timestamp', Date.now().toString())
      
      // Ensure we're redirecting to the correct origin based on environment
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        // Ensure we redirect to localhost, not production
        window.location.href = window.location.origin + '/'
      } else {
        // Production redirect
        window.location.href = '/'
      }
    } else {
      // Regular redirect to home
      window.location.href = '/'
    }
  }, [returnTo])

  // Handle redirection after successful sign-in
  useEffect(() => {
    // If user is authenticated and we have a return_to parameter, redirect
    if (user && returnTo === 'analysis') {
      // Use a small timeout to ensure the UI updates before redirect
      const timer = setTimeout(() => {
        handleRedirectAfterAuth(user.id)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [user, returnTo, handleRedirectAfterAuth])

  const validateEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset error states
    setValidationError(null)
    setMessage(null)
    
    // Validate email
    if (!email.trim()) {
      setValidationError("Email is required")
      return
    }
    
    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address")
      return
    }
    
    setIsLoading(true)

    try {
      // Create a wrapper function to handle the passwordless sign-in
      const passwordlessSignIn = async (email: string) => {
        try {
          // Since auth-context signIn requires password, we'll use a different approach
          // Get Supabase client
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            return { error: new Error("Missing Supabase configuration") }
          }

          // Use fetch to call the passwordless sign-in API directly
          const response = await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
            },
            body: JSON.stringify({
              email,
              redirect_to: `${window.location.origin}/auth/login-callback`
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            // Check for rate limit error
            if (errorData.error_code === 'over_email_send_rate_limit') {
              return { error: new Error('Too many magic link requests. Please wait a minute before trying again.') }
            }
            return { error: new Error(errorData.error_description || errorData.msg || 'Failed to send magic link') }
          }
          
          return { error: null }
        } catch (err) {
          return { error: err instanceof Error ? err : new Error('Unknown error') }
        }
      }
      
      // Call our passwordless sign-in wrapper
      const { error } = await passwordlessSignIn(email)
      
      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ 
          type: "success", 
          text: "✅ Link sent successfully! Check your email." 
        })
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "An unexpected error occurred. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      
      // Store environment information for callback
      storeEnvironmentInfo();
      
      // Save return_to info so callback can use it
      if (returnTo) {
        localStorage.setItem('auth_return_to', returnTo);
      }
      
      // Get Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase configuration");
      }
      
      // Get the current origin for local development, or use production URL
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      
      // Use the appropriate redirect URL based on environment
      const redirectTo = isLocalhost 
        ? `${window.location.origin}/auth/capture`
        : `https://hootai.am/auth/capture`;
      
      // Create a temporary Supabase client for sign-in
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false, // Disable auto refresh to prevent lock issues
          persistSession: true,
          flowType: 'implicit', // Use implicit flow instead of PKCE to avoid code verifier issues
        }
      });
      
      // Use the Supabase client to sign in with Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo, // Use environment-specific redirect URL
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // The page will redirect to Google, so we don't need to do anything else here
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to sign in with Google" 
      })
      setIsGoogleLoading(false)
    }
  }

  // To prevent hydration mismatch, render a skeleton during SSR
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Sign in</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Continue with</span>
                </div>
              </div>
              
              <Button
                disabled={true}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Google
              </Button>
            </div>

            <div className="text-center text-sm">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Handle params with proper Suspense boundary */}
        <Suspense fallback={null}>
          <ParamsHandler onParamsReady={handleParamsReady} />
        </Suspense>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-md border border-green-100 text-center">
              <p className="text-green-800 font-medium">You&apos;re signed in as {user.email}</p>
            </div>
            
            <div className="flex justify-center">
              <Link href="/">
                <Button className="flex items-center gap-2">
                  Continue to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Show URL error if present */}
            {urlError && (
              <div className="p-4 bg-red-50 rounded-md border border-red-100">
                <p className="text-red-800 text-sm">{urlError}</p>
              </div>
            )}
            
            {/* Show message if present */}
            {message && (
              <div className={`p-4 rounded-md border ${
                message.type === "success" 
                  ? "bg-green-50 border-green-100" 
                  : "bg-red-50 border-red-100"
              }`}>
                <p className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                  {message.text}
                </p>
              </div>
            )}
            
            {/* Email sign-in form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {validationError && (
                  <p className="text-sm text-red-500 mt-1">{validationError}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending link..." : "Send Magic Link"}
              </Button>
            </form>
            
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Continue with</span>
                </div>
              </div>
              
              <Button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Google
              </Button>
            </div>

            <div className="text-center text-sm">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
} 