"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { useSearchParams } from "next/navigation"

// Component to handle URL params - isolated to ensure proper Suspense boundary
function ParamsHandler({ onParamsReady }: { 
  onParamsReady: (returnTo: string | null) => void 
}) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const returnTo = searchParams?.get('return_to')
    onParamsReady(returnTo)
  }, [searchParams, onParamsReady])
  
  return null
}

// Main content component
function SignUpContent() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [returnTo, setReturnTo] = useState<string | null>(null)
  const { user } = useAuth()

  // Handle redirection after successful sign-up
  useEffect(() => {
    // If user is authenticated and we have a return_to parameter, redirect
    if (user && returnTo === 'analysis') {
      // Use a small timeout to ensure the UI updates before redirect
      const timer = setTimeout(() => {
        // Set the preservation flag
        localStorage.setItem('preserve_analysis', 'true')
        
        // Create a timestamp to help with debugging
        localStorage.setItem('login_timestamp', Date.now().toString())
        
        // Use current origin to stay in local environment
        window.location.href = window.location.origin + '/'
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [user, returnTo])

  const validateEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSignUp = async (e: React.FormEvent) => {
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
      // Create a wrapper function to handle the passwordless sign-up
      const passwordlessSignUp = async (email: string) => {
        try {
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
      
      // Call our passwordless sign-up wrapper
      const { error } = await passwordlessSignUp(email)
      
      if (error) {
        console.error("Email sign-up error:", error)
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ 
          type: "success", 
          text: "Check your email for a login link!" 
        })
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "An unexpected error occurred. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    try {
      setIsGoogleLoading(true)
      
      // Check if we're in a local environment
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // For localhost, we need special handling to prevent redirection to production
      if (isLocalhost) {
        // Store the local origin for callback to use
        localStorage.setItem('force_local_redirect', 'true');
        localStorage.setItem('local_origin', window.location.origin);
        localStorage.setItem('dev_mode', 'true');
        localStorage.setItem('dev_port', window.location.port || '3000');
        
        // Save return_to info so callback can use it
        if (returnTo) {
          localStorage.setItem('auth_return_to', returnTo);
        }
        
        // Explicitly use the full callback URL with the origin
        const redirectTo = `${window.location.origin}/auth/login-callback`;
        
        // Hard-code the production Supabase URL for auth
        const supabaseAuthUrl = 'https://eaennrqqtlmanbivdhqm.supabase.co';
        
        // Create Google auth URL with specific redirect parameters
        // Use localhost:3000 as the redirect URL in the request to Supabase
        const googleAuthUrl = `${supabaseAuthUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
        
        // Log for debugging
        console.log('Using localhost Google auth URL:', googleAuthUrl);
        
        // Redirect browser directly to Google auth
        window.location.href = googleAuthUrl;
        return;
      }
      
      // For production, use the regular process
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (!supabaseUrl) {
        setMessage({ type: "error", text: "Missing Supabase URL configuration" })
        setIsGoogleLoading(false)
        return
      }
      
      // Save return_to info to localStorage so callback can use it
      if (returnTo) {
        localStorage.setItem('auth_return_to', returnTo)
      }
      
      // Construct the redirect URL - always explicitly use full origin
      const redirectUrl = `${window.location.origin}/auth/login-callback`
      
      // Construct Google OAuth URL directly
      const googleAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`
      
      // Redirect browser directly to Google auth
      window.location.href = googleAuthUrl
    } catch (err) {
      console.error("Error during Google sign-up:", err)
      setMessage({ 
        type: "error", 
        text: err instanceof Error ? err.message : "An unknown error occurred"
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Handle params with proper Suspense boundary */}
        <Suspense fallback={null}>
          <ParamsHandler onParamsReady={setReturnTo} />
        </Suspense>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to get started
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-md border border-green-100 text-center">
              <p className="text-green-800 font-medium">You&apos;re signed in as {user.email}</p>
            </div>
            
            <div className="flex justify-center">
              <Link href="/protected">
                <Button className="flex items-center gap-2">
                  <Lock size={16} /> View Protected Content
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    // Clear validation error when user types
                    if (validationError) setValidationError(null)
                  }}
                  className={`w-full ${validationError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
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
                {isLoading ? "Sending link..." : "Send Sign-up Link"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Connecting..."
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>

            {message && (
              <div className={`p-3 rounded-md ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800" 
                  : "bg-red-50 text-red-800"
              }`}>
                {message.text}
              </div>
            )}

            <div className="text-center text-sm">
              <p>
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center pt-4">
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-600"> 
            <ArrowLeft size={14} /> Back to Main Page
          </Link>
        </div>
      </div>
    </div>
  )
}

// Main component
export default function SignUp() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  )
} 