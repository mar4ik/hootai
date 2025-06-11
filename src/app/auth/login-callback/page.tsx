"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

// ContentWrapper component that properly handles params
function ContentWithParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Create a Supabase client just for handling this callback
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
        
        // Get hash or code from URL
        // For Supabase Auth, the session information is in the URL hash (for magic link) 
        // or search params (for OAuth)
        const code = searchParams?.get('code')
        const accessToken = searchParams?.get('access_token')
        const hash = typeof window !== 'undefined' ? window.location.hash : ''
        
        // If we have any of these, try to exchange them for a session
        if (hash || code || accessToken) {
          console.log("Found auth params in URL, exchanging for session...")
          
          // This will detect and exchange tokens in the URL
          const { error: exchangeError } = await supabase.auth.getSession()
          
          if (exchangeError) {
            throw new Error(`Failed to exchange session: ${exchangeError.message}`)
          }
          
          // Set success status
          setStatus("success")
          
          // Set a cookie to indicate successful auth (for debugging)
          document.cookie = `auth_success=true; path=/; max-age=86400`
          
          // Check if we have a return_to value in localStorage
          const returnTo = localStorage.getItem('auth_return_to')
          
          // Start countdown for redirect
          const intervalId = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(intervalId)
                // Redirect based on returnTo value
                if (returnTo === 'analysis') {
                  // Clear the return_to value
                  localStorage.removeItem('auth_return_to')
                  // Add a flag to indicate this is a post-auth return to analysis
                  localStorage.setItem('preserve_analysis', 'true')
                  router.push('/')
                } else {
                  router.push('/')
                }
              }
              return prev - 1
            })
          }, 1000)
          
          return () => clearInterval(intervalId)
        } else {
          throw new Error("No authentication tokens found in URL")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Unknown error")
      }
    }
    
    handleCallback()
  }, [router, searchParams])
  
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
                  Redirecting you in {countdown} seconds...
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <Link href="/" className="text-blue-600 hover:underline">
                  Go to home
                </Link>
                <Link href="/profile" className="text-blue-600 hover:underline">
                  Go to profile
                </Link>
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
                <Link href="/" className="text-blue-600 hover:underline">
                  Go to home
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
      <ContentWithParams />
    </Suspense>
  )
} 