"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { useSearchParams } from "next/navigation"

// Create a component to handle URL params
function ErrorFromParams({ setMessage }: { setMessage: (message: { type: "success" | "error", text: string } | null) => void }) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const errorParam = searchParams?.get('error')
    if (errorParam) {
      setMessage({ 
        type: "error", 
        text: decodeURIComponent(errorParam)
      })
    }
  }, [searchParams, setMessage])
  
  return null
}

// Main sign-in component
function SignInContent() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()
  
  // Check for auth state
  useEffect(() => {
    console.log("Sign-in page - Auth state:", user ? "Logged in" : "Not logged in")
  }, [user])

  useEffect(() => {
    // Get error from URL
    const errorParam = searchParams?.get('error')
    if (errorParam) {
      setMessage({ 
        type: "error", 
        text: decodeURIComponent(errorParam)
      })
    }
  }, [searchParams])

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
      console.log("Initiating email sign-in for:", email)
      
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
            return { error: new Error(errorData.error_description || 'Failed to send magic link') }
          }
          
          return { error: null }
        } catch (err) {
          return { error: err instanceof Error ? err : new Error('Unknown error') }
        }
      }
      
      // Call our passwordless sign-in wrapper
      const { error } = await passwordlessSignIn(email)
      
      if (error) {
        console.error("Email sign-in error:", error)
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ 
          type: "success", 
          text: "Check your email for a login link!" 
        })
      }
    } catch (error) {
      console.error("Unexpected error during email sign-in:", error)
      setMessage({ 
        type: "error", 
        text: "An unexpected error occurred. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    try {
      setIsLoading(true)
      console.log("Starting Google OAuth flow with direct redirect...")
      
      // Get required environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      if (!supabaseUrl) {
        setMessage({ type: "error", text: "Missing Supabase URL configuration" })
        setIsLoading(false)
        return
      }
      
      // Construct the redirect URL
      const redirectUrl = `${window.location.origin}/auth/login-callback`
      
      // Construct Google OAuth URL directly - NO state parameter to avoid mismatch
      const googleAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`
      
      console.log("Redirecting to:", googleAuthUrl)
      
      // Redirect browser directly to Google auth
      window.location.href = googleAuthUrl
    } catch (err) {
      console.error("Error during Google sign-in:", err)
      setMessage({ 
        type: "error", 
        text: err instanceof Error ? err.message : "An unknown error occurred"
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Wrap the error param handler in Suspense */}
        <Suspense fallback={null}>
          <ErrorFromParams setMessage={setMessage} />
        </Suspense>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a magic link
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
            <form onSubmit={handleSignIn} className="space-y-4">
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
                {isLoading ? "Sending link..." : "Sign in with Email"}
              </Button>
            </form>

            {message && (
              <div className={`p-4 rounded-md ${
                message.type === "success" 
                  ? "bg-green-50 border border-green-100 text-green-800" 
                  : "bg-red-50 border border-red-100 text-red-800"
              }`}>
                <p>{message.text}</p>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </div>
        )}

        <div className="flex justify-center">
          <Link href="/" className="text-sm text-gray-600 flex items-center space-x-1 hover:text-gray-800">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Wrapped with Suspense
export default function SignIn() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
} 