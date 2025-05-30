"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if Supabase is configured properly
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

// Create Supabase client if configured, otherwise null
const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

// Development mode flag
const DEV_MODE = !isSupabaseConfigured || process.env.NODE_ENV === "development"

type User = {
  id: string
  email?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      // In development mode without Supabase, use a mock user
      if (DEV_MODE) {
        // Mock user for development
        setUser({
          id: "dev-user-id",
          email: "dev@example.com",
        })
        setLoading(false)
        return
      }
      
      // Regular Supabase authentication
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          })
        }
      }
      
      setLoading(false)
    }

    // Set up auth state listener (only if Supabase is configured)
    let subscription: { unsubscribe: () => void } | null = null
    
    if (supabase) {
      const result = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          })
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      })
      
      subscription = result.data.subscription
    }

    checkSession()
    
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string) => {
    // In development mode without Supabase, simulate successful login
    if (DEV_MODE) {
      // Set a development user
      setUser({
        id: "dev-user-id",
        email: email || "dev@example.com",
      })
      return { error: null }
    }
    
    // Regular Supabase sign-in
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error }
    }
    
    // If Supabase is not configured, return a configuration error
    return { 
      error: new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.") 
    }
  }

  const signInWithGoogle = async () => {
    // In development mode without Supabase, simulate successful login
    if (DEV_MODE) {
      // Set a development user
      setUser({
        id: "dev-user-id",
        email: "google-user@example.com",
      })
      return { error: null }
    }
    
    // Regular Supabase sign-in with Google
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error }
    }
    
    // If Supabase is not configured, return a configuration error
    return { 
      error: new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.") 
    }
  }

  const signOut = async () => {
    if (DEV_MODE) {
      // Just clear the user state in development mode
      setUser(null)
      return
    }
    
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 