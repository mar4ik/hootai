"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AuthResetPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [resetComplete, setResetComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const addLog = (message: string) => {
    console.log(`AUTH RESET: ${message}`)
    setLogs(prev => [...prev, message])
  }
  
  useEffect(() => {
    const resetAuth = async () => {
      try {
        addLog("Starting auth reset process...")
        
        // 1. Clear all cookies related to Supabase
        addLog("Clearing auth cookies...")
        const cookies = document.cookie.split(';')
        
        for (const cookie of cookies) {
          const [name] = cookie.split('=').map(part => part.trim())
          
          if (name.startsWith('sb-') || name.includes('supabase') || name === 'auth_success' || name === 'user_id') {
            // Clear the cookie by setting expiration in the past
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
            addLog(`Cleared cookie: ${name}`)
          }
        }
        
        // 2. Clear local storage items related to Supabase
        addLog("Clearing local storage...")
        if (typeof localStorage !== 'undefined') {
          // Find all Supabase related items
          const itemsToRemove: string[] = []
          
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.includes('supabase') || key.includes('sb-'))) {
              itemsToRemove.push(key)
            }
          }
          
          // Remove them
          itemsToRemove.forEach(key => {
            localStorage.removeItem(key)
            addLog(`Removed from localStorage: ${key}`)
          })
          
          addLog(`Cleared ${itemsToRemove.length} items from localStorage`)
        } else {
          addLog("WARNING: localStorage not available")
        }
        
        // 3. Also clear session storage
        addLog("Clearing session storage...")
        if (typeof sessionStorage !== 'undefined') {
          // Clear entire session storage to be safe
          sessionStorage.clear()
          addLog("Session storage cleared")
        } else {
          addLog("WARNING: sessionStorage not available")
        }
        
        // 4. Success
        addLog("Auth reset complete!")
        setResetComplete(true)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        addLog(`ERROR: ${errorMessage}`)
        setError(`Failed to reset auth: ${errorMessage}`)
      }
    }
    
    resetAuth()
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Reset</h1>
          <p className="text-gray-600">This tool clears authentication data from your browser</p>
        </div>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        ) : resetComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-700 mb-2">Reset Complete</h2>
            <p className="mb-4">Your authentication data has been cleared successfully.</p>
            <div className="flex justify-center">
              <Link href="/auth/sign-in" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Sign In Again
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin mr-3"></div>
            <p>Resetting authentication data...</p>
          </div>
        )}
        
        <div className="bg-gray-100 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Reset Log</h2>
          <div className="bg-white border border-gray-200 rounded p-3 h-48 overflow-y-auto font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center space-x-3">
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Home
          </Link>
          <Link href="/auth-check" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Auth Check
          </Link>
          {resetComplete && (
            <Link href="/profile-repair" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Repair Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 