"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthDebugPage() {
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({})
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    setIsClient(true)
    
    // Check for session in localStorage
    const storageKeys = ['supabase.auth.token', 'supabase.auth.refreshToken', 'supabase.auth.accessToken']
    const storage: Record<string, string> = {}
    
    storageKeys.forEach(key => {
      try {
        const item = localStorage.getItem(key)
        if (item) {
          storage[key] = item.substring(0, 100) + '...'
        } else {
          storage[key] = 'Not found'
        }
      } catch (e) {
        storage[key] = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
      }
    })
    
    setLocalStorageData(storage)
    setCookies(document.cookie)
    
    // Try to connect to Supabase and get session
    const checkSession = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        
        if (!supabaseUrl || !supabaseKey) {
          setSessionData({ error: 'Supabase credentials missing' })
          return
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
          }
        })
        
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setSessionData({ error: error.message })
        } else {
          setSessionData(data)
        }
      } catch (err) {
        setSessionData({ 
          error: err instanceof Error ? err.message : 'Unknown error' 
        })
      }
    }
    
    checkSession()
  }, [])

  if (!isClient) {
    return <div className="p-8">Loading debug information...</div>
  }

  // Parse all URL parameters
  const allParams: Record<string, string> = {}
  if (searchParams) {
    for (const [key, value] of searchParams.entries()) {
      allParams[key] = value
    }
  }
  
  const resetAuth = () => {
    try {
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('supabase.auth.refreshToken')
      localStorage.removeItem('supabase.auth.accessToken')
      
      // Clear all cookies
      const allCookies = document.cookie.split(';')
      for (let i = 0; i < allCookies.length; i++) {
        const cookie = allCookies[i]
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
      
      alert('Auth data cleared! The page will now refresh.')
      window.location.reload()
    } catch (e) {
      alert(`Error clearing auth data: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Information</h1>
      
      <div className="mb-8">
        <div className="flex space-x-4 mb-4">
          <Link href="/auth/sign-in" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Sign In
          </Link>
          <Link href="/profile" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Go to Profile
          </Link>
          <button 
            onClick={resetAuth}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset Auth Data
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <DebugSection title="URL Parameters" data={allParams} />
        
        <DebugSection 
          title="Session Status" 
          data={{
            hasActiveSession: sessionData?.session ? 'Yes' : 'No',
            ...(sessionData?.session ? {
              userId: sessionData.session.user.id,
              email: sessionData.session.user.email,
              provider: sessionData.session.user.app_metadata?.provider || 'unknown',
              expiresAt: new Date(sessionData.session.expires_at * 1000).toLocaleString(),
            } : {}),
            ...(sessionData?.error ? { error: sessionData.error } : {})
          }} 
        />
        
        <DebugSection title="LocalStorage" data={localStorageData} />
        
        <DebugSection 
          title="Cookies" 
          data={{ 
            allCookies: cookies || 'No cookies found'
          }} 
        />
        
        <DebugSection 
          title="Browser Info" 
          data={{
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Yes' : 'No'
          }} 
        />
      </div>
    </div>
  )
}

function DebugSection({ title, data }: { title: string, data: Record<string, any> }) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
} 