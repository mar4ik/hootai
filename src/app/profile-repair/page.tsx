"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@supabase/supabase-js"
import { ensureUserProfile, getUserProfile } from "@/lib/user-service"
import Link from "next/link"

export default function ProfileRepairPage() {
  const { user, loading } = useAuth()
  const [status, setStatus] = useState<string>("Initializing...")
  const [isRepairing, setIsRepairing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [success, setSuccess] = useState<boolean | null>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`])
  }

  // Check status on load
  useEffect(() => {
    if (!loading) {
      if (user) {
        setStatus(`Ready to repair profile for ${user.email}`)
        addLog(`Authenticated as: ${user.email} (${user.id})`)
      } else {
        setStatus("Not authenticated")
        addLog("Not authenticated. Please sign in first.")
      }
    }
  }, [user, loading])

  // Profile repair procedure
  const repairProfile = async () => {
    if (!user) {
      addLog("ERROR: No authenticated user")
      return
    }

    setIsRepairing(true)
    setSuccess(null)
    addLog("Starting profile repair process...")

    try {
      // Step 1: Get environment information
      addLog("Checking environment...")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

      if (!supabaseUrl || !supabaseKey) {
        addLog("WARNING: Missing Supabase credentials in environment variables")
        
        // Try window globals if available
        if (typeof window !== 'undefined' && (window as { ENV_SUPABASE_URL?: string }).ENV_SUPABASE_URL) {
          addLog("Found fallback URL in window.ENV_SUPABASE_URL")
        } else {
          addLog("Using hardcoded fallback URL")
        }
      }

      // Step 2: Create a direct Supabase client
      addLog("Creating Supabase client...")
      const fallbackUrl = 'https://eaennrqqtlmanbivdhqm.supabase.co'
      const effectiveUrl = supabaseUrl || fallbackUrl
      
      const supabase = createClient(effectiveUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      })

      // Step 3: Check if profile exists directly
      addLog("Checking if profile exists directly...")
      const { data: existingProfiles, error: checkError, count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('id', user.id)

      if (checkError) {
        addLog(`ERROR checking profile: ${checkError.message}`)
      } else {
        addLog(`Found ${count || 0} profiles for user`)
        
        if (existingProfiles && existingProfiles.length > 0) {
          addLog("Existing profile found, will update it")
        } else {
          addLog("No existing profile found, will create a new one")
        }
      }

      // Step 4: Create/Update profile
      addLog("Creating/updating profile...")
      const profile = await ensureUserProfile(user.id)
      
      if (profile) {
        addLog("✅ Profile created/updated successfully!")
        addLog(`Profile data: ${JSON.stringify(profile)}`)
        
        // Step 5: Verify profile is readable
        addLog("Verifying profile is readable...")
        const verifyProfile = await getUserProfile(user.id)
        
        if (verifyProfile) {
          addLog("✅ Profile is readable!")
          setSuccess(true)
        } else {
          addLog("❌ Profile was created but is not readable!")
          setSuccess(false)
        }
      } else {
        addLog("❌ Failed to create/update profile")
        setSuccess(false)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addLog(`❌ ERROR: ${errorMessage}`)
      setSuccess(false)
    } finally {
      setIsRepairing(false)
      addLog("Repair process completed")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Loading...</h1>
            <p className="text-gray-600">Please wait while we check your authentication status</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile Repair Tool</h1>
          <p className="text-gray-600">This tool will attempt to fix profile loading issues</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Status</h2>
          <p className={`py-2 px-3 rounded ${
            !user ? 'bg-red-100 text-red-800' :
            success === true ? 'bg-green-100 text-green-800' :
            success === false ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status}
          </p>
        </div>
        
        {!user ? (
          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg text-red-700 mb-2">Not Signed In</h2>
            <p className="mb-4">You need to be signed in to repair your profile.</p>
            <Link href="/auth/sign-in" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <button
                onClick={repairProfile}
                disabled={isRepairing}
                className={`px-6 py-3 rounded-lg font-medium text-white ${
                  isRepairing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRepairing ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></span>
                    Repairing...
                  </>
                ) : (
                  'Repair My Profile'
                )}
              </button>
            </div>
            
            {success === true && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg text-green-700 mb-2">Success!</h2>
                <p className="mb-4">Your profile has been successfully repaired.</p>
                <Link href="/profile" className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Go to Profile
                </Link>
              </div>
            )}
            
            {success === false && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg text-red-700 mb-2">Repair Failed</h2>
                <p>Please check the logs below for more information.</p>
              </div>
            )}
          </>
        )}
        
        <div className="bg-gray-900 text-white p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2 text-gray-200">Logs</h2>
          <div className="font-mono text-xs h-60 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center space-x-3 pt-4">
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Home
          </Link>
          <Link href="/debug/profile-check" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Profile Diagnostics
          </Link>
          <Link href="/auth-check" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Auth Check
          </Link>
        </div>
      </div>
    </div>
  )
} 