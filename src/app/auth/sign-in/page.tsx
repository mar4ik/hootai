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

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { signIn, user } = useAuth()
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
      const { error } = await signIn(email)
      
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
      const redirectUrl = `${window.location.origin}/auth/callback`
      
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
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Connecting..."
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  Sign in with Google
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
                
                {/* Add a button to reload if there's an error about session */}
                {message.type === "error" && message.text.includes("session") && (
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        console.log("Forcing page reload to restore auth state");
                        window.location.reload();
                      }}
                    >
                      Reload Page
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="text-center text-sm">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
              {message?.type === "error" && (
                <p className="mt-2 text-xs text-gray-500">
                  Having trouble?{" "}
                  <Link href="/auth/debug" className="text-blue-600 hover:text-blue-500">
                    Debug Auth
                  </Link>
                </p>
              )}
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