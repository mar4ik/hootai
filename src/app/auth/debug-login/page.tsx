""use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function DebugLogin() {
  const [localData, setLocalData] = useState<Record<string, string>>({})
  const [cookies, setCookies] = useState<string>("")
  const [hostname, setHostname] = useState<string>("")
  const [origin, setOrigin] = useState<string>("")
  const [fullUrl, setFullUrl] = useState<string>("")
  
  useEffect(() => {
    // Get localStorage items
    const data: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        data[key] = localStorage.getItem(key) || ""
      }
    }
    setLocalData(data)
    
    // Get cookies
    setCookies(document.cookie)
    
    // Get host info
    setHostname(window.location.hostname)
    setOrigin(window.location.origin)
    setFullUrl(window.location.href)
  }, [])
  
  // Function to force setting localStorage values
  const setLocalStorageValues = () => {
    localStorage.setItem('force_local_redirect', 'true')
    localStorage.setItem('local_origin', window.location.origin)
    localStorage.setItem('dev_mode', 'true')
    localStorage.setItem('dev_port', window.location.port || '3000')
    
    // Refresh the displayed data
    const data: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        data[key] = localStorage.getItem(key) || ""
      }
    }
    setLocalData(data)
  }
  
  // Function to clear localStorage values
  const clearLocalStorageValues = () => {
    localStorage.removeItem('force_local_redirect')
    localStorage.removeItem('local_origin')
    localStorage.removeItem('dev_mode')
    localStorage.removeItem('dev_port')
    
    // Refresh the displayed data
    const data: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        data[key] = localStorage.getItem(key) || ""
      }
    }
    setLocalData(data)
  }
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">Environment Info</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              <p><strong>Hostname:</strong> {hostname}</p>
              <p><strong>Origin:</strong> {origin}</p>
              <p><strong>Full URL:</strong> {fullUrl}</p>
            </div>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">localStorage Data</h2>
            <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre>{JSON.stringify(localData, null, 2)}</pre>
            </div>
            
            <div className="mt-4 space-y-2">
              <button 
                onClick={setLocalStorageValues}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Set Debug Values
              </button>
              <button 
                onClick={clearLocalStorageValues}
                className="ml-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Clear Debug Values
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Cookies</h2>
            <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre>{cookies || "(no cookies)"}</pre>
            </div>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Auth Test Links</h2>
            <div className="space-y-2">
              <div>
                <Link 
                  href="/auth/sign-in"
                  className="block w-full bg-green-500 text-white text-center px-4 py-2 rounded-md hover:bg-green-600 transition"
                >
                  Test Sign In Flow
                </Link>
              </div>
              <div>
                <Link 
                  href="/auth/sign-up"
                  className="block w-full bg-purple-500 text-white text-center px-4 py-2 rounded-md hover:bg-purple-600 transition"
                >
                  Test Sign Up Flow
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Link 
            href="/"
            className="text-blue-600 hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )"
