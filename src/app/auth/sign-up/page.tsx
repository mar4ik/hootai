"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import Image from "next/image"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { signIn, signInWithGoogle, user } = useAuth()

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
      const response = await signIn(email)
      
      if (response.error) {
        setMessage({ type: "error", text: response.error.message })
      } else {
        setMessage({ 
          type: "success", 
          text: "Check your email for a confirmation link!" 
        })
      }
    } catch {
      setMessage({ 
        type: "error", 
        text: "An unexpected error occurred. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setMessage(null)
    setIsGoogleLoading(true)
    
    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        setMessage({ type: "error", text: error.message })
      }
      // No need to set success message as it redirects to Google
    } catch {
      setMessage({ 
        type: "error", 
        text: "Failed to connect to Google. Please try again." 
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
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
                {isLoading ? "Creating account..." : "Sign up with Email"}
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