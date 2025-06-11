"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

export default function DebugAuth() {
  const [env, setEnv] = useState<Record<string, string>>({})
  const [storage, setStorage] = useState<Record<string, string>>({})
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [supabaseStatus, setSupabaseStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  useEffect(() => {
    // Collect environment info
    const envInfo: Record<string, string> = {
      hostname: window.location.hostname,
      origin: window.location.origin,
      pathname: window.location.pathname,
      isLocalhost: (window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1').toString()
    }
    setEnv(envInfo)
    
    // Collect localStorage items
    const storageItems: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        storageItems[key] = localStorage.getItem(key) || ''
      }
    }
    setStorage(storageItems)
    
    // Check Supabase session
    const checkSession = async () => {
      try {
        // Create Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase configuration")
        }
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        // Get current session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        setSessionInfo(data)
        setSupabaseStatus("success")
      } catch (error) {
        console.error("Error checking session:", error)
        setSupabaseStatus("error")
        setErrorMsg(error instanceof Error ? error.message : "Unknown error")
      }
    }
    
    checkSession()
  }, [])
  
  // Function to reset local storage auth values
  const resetLocalStorage = () => {
    localStorage.removeItem('force_local_redirect')
    localStorage.removeItem('local_origin')
    localStorage.removeItem('dev_mode')
    localStorage.removeItem('dev_port')
    localStorage.removeItem('auth_return_to')
    localStorage.removeItem('redirect_attempted')
    
    // Refresh storage state
    const storageItems: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        storageItems[key] = localStorage.getItem(key) || ''
      }
    }
    setStorage(storageItems)
  }
  
  // Function to set local storage for development mode
  const setDevMode = () => {
    localStorage.setItem('force_local_redirect', 'true')
    localStorage.setItem('local_origin', window.location.origin)
    localStorage.setItem('dev_mode', 'true')
    localStorage.setItem('dev_port', window.location.port || '3000')
    
    // Refresh storage state
    const storageItems: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        storageItems[key] = localStorage.getItem(key) || ''
      }
    }
    setStorage(storageItems)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Debugging</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Environment Info</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap">{JSON.stringify(env, null, 2)}</pre>
            </div>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">Local Storage</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap">{JSON.stringify(storage, null, 2)}</pre>
            </div>
            
            <div className="mt-4 space-x-3">
              <button 
                onClick={resetLocalStorage}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Reset Auth Storage
              </button>
              <button 
                onClick={setDevMode}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Set Dev Mode
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">Supabase Session</h2>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              {supabaseStatus === "loading" && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-8 h-8 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin"></div>
                  <span className="ml-2">Checking session...</span>
                </div>
              )}
              
              {supabaseStatus === "success" && (
                <pre className="whitespace-pre-wrap">{JSON.stringify(sessionInfo, null, 2)}</pre>
              )}
              
              {supabaseStatus === "error" && (
                <div className="text-red-500">
                  <p className="font-medium">Error checking session:</p>
                  <p>{errorMsg}</p>
                </div>
              )}
            </div>
            
            <h2 className="text-lg font-semibold mb-3">Auth Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/auth/sign-in"
                className="block w-full bg-green-500 text-white text-center px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Go to Sign In
              </Link>
              <Link 
                href="/auth/sign-up"
                className="block w-full bg-purple-500 text-white text-center px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                Go to Sign Up
              </Link>
              <Link 
                href="/"
                className="block w-full bg-gray-500 text-white text-center px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 