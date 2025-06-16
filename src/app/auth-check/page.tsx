"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function AuthCheckPage() {
  const { user, loading, error } = useAuth()
  const [authState, setAuthState] = useState<string>("Loading...")
  const [cookies, setCookies] = useState<string[]>([])
  const [isReady, setIsReady] = useState(false)
  const [loadTime, setLoadTime] = useState(0)
  const [authContextDebug, setAuthContextDebug] = useState<string>("")
  
  // Track loading time
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      setLoadTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    // Get auth context details
    try {
      setAuthContextDebug(`
Auth loading: ${loading}
Auth error: ${error || 'none'}
User: ${user ? JSON.stringify(user, null, 2) : 'null'}
Window object: ${typeof window !== 'undefined' ? 'available' : 'not available'}
Document object: ${typeof document !== 'undefined' ? 'available' : 'not available'}
Local Storage: ${typeof localStorage !== 'undefined' ? 'available' : 'not available'}
`)
    } catch (err) {
      setAuthContextDebug(`Error getting auth context: ${err instanceof Error ? err.message : String(err)}`)
    }
    
    // Wait a moment to make sure everything is initialized
    const timer = setTimeout(() => {
      setIsReady(true)
      
      // Get all cookies
      if (typeof document !== 'undefined') {
        setCookies(document.cookie.split(';').map(c => c.trim()))
      }
      
      // Set auth state
      if (loading) {
        setAuthState(`Still loading authentication... (${loadTime}s)`)
      } else if (user) {
        setAuthState(`Authenticated as: ${user.email} (${user.id})`)
      } else {
        setAuthState(`Not authenticated - no user found. Error: ${error || 'none'}`)
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [user, loading, error, loadTime])
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Check</h1>
          <p className="text-gray-600">This page shows your current authentication status</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Authentication Status</h2>
          <p className={`py-2 px-3 rounded ${
            loading ? 'bg-yellow-100 text-yellow-800' :
            user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {authState}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Authentication Context Debug</h2>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap">
            {authContextDebug || "No debug information available"}
          </pre>
        </div>
        
        {loading && loadTime > 5 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h2 className="font-semibold text-lg text-yellow-700 mb-2">Loading Taking Too Long</h2>
            <p className="text-sm mb-2">
              Authentication has been loading for {loadTime} seconds. This may indicate an issue with:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-yellow-700">
              <li>Network connectivity to Supabase</li>
              <li>Session token expiration</li>
              <li>Browser cookie or storage issues</li>
            </ul>
            <div className="mt-3">
              <Link href="/auth/sign-in" className="text-blue-600 hover:underline text-sm">
                Try signing in again
              </Link>
            </div>
          </div>
        )}
        
        {isReady && (
          <>
            {user ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg mb-2">User Details</h2>
                <div className="overflow-auto max-h-40">
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </div>
            ) : !loading ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg text-red-700 mb-2">Not Authenticated</h2>
                <p className="text-sm mb-3">
                  You are not signed in or your session has expired.
                </p>
                <Link href="/auth/sign-in" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                  Sign in
                </Link>
              </div>
            ) : null}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-2">Cookies ({cookies.length})</h2>
              {cookies.length > 0 ? (
                <div className="overflow-auto max-h-40">
                  <ul className="text-xs space-y-1">
                    {cookies.map((cookie, i) => (
                      <li key={i} className="bg-gray-100 p-2 rounded">{cookie}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-red-600">No cookies found</p>
              )}
            </div>
          </>
        )}
        
        <div className="flex justify-center space-x-3">
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
            Home Page
          </Link>
          <Link href="/profile-repair" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
            Repair Profile
          </Link>
          <Link href="/auth/sign-in" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
            Sign In Again
          </Link>
        </div>
      </div>
    </div>
  )
} 