"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@supabase/supabase-js"
import { updateLastSignInTime, getUserProfile, ensureUserProfile } from "./user-service"

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
//const DEV_MODE = !isSupabaseConfigured || process.env.NODE_ENV === "development"

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
  forceCreateProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileChecked, setProfileChecked] = useState(false)

  // Ensure loading state resolves even if there's an issue
  useEffect(() => {
    // Set a maximum loading time of 10 seconds
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Auth loading timed out, forcing resolution")
        setLoading(false)
      }
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [loading])

  // Force create a profile for the current user - can be called anywhere in the app
  const forceCreateProfile = async () => {
    if (!user) return
    
    console.log("Force creating profile for user:", user.id)
    try {
      // Try direct insert first
      if (supabase) {
        await supabase
          .from('user_profiles')
          .insert([{ 
            id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_sign_in: new Date().toISOString()
          }])
          .select()
          .single()
          .then(({ data, error }) => {
            if (error) {
              // If profile exists (duplicate key error), try to update instead
              if (error.code === '23505') { // PostgreSQL duplicate key error
                console.log("Profile exists, updating...")
                return supabase
                  .from('user_profiles')
                  .update({ 
                    updated_at: new Date().toISOString(),
                    last_sign_in: new Date().toISOString()
                  })
                  .eq('id', user.id)
              } else {
                console.error("Profile creation error:", error)
              }
            } else {
              console.log("Profile created successfully:", data)
            }
          })
      }
    } catch (err) {
      console.error("Error in force profile creation:", err)
    }
  }

  // Add a new effect to ensure profile exists when user is loaded
  useEffect(() => {
    if (user && !loading && supabase && !profileChecked) {
      console.log("User detected, ensuring profile exists:", user.id)
      ensureUserProfile(user.id)
        .then(profile => {
          console.log("Profile status:", profile ? "exists/created" : "failed to create")
          setProfileChecked(true)
          
          // If profile creation failed, try again after a delay
          if (!profile) {
            setTimeout(() => {
              forceCreateProfile()
            }, 2000)
          }
        })
        .catch(err => {
          console.error("Error in profile creation:", err)
          
          // Try again after a delay if there was an error
          setTimeout(() => {
            forceCreateProfile()
          }, 2000)
        })
    }
  }, [user, loading, profileChecked])

  // Check profile on interval to ensure it always exists
  useEffect(() => {
    if (!user || !supabase) return
    
    // Periodically check profile (every 10 seconds)
    const intervalId = setInterval(() => {
      console.log("Periodic profile check...")
      getUserProfile(user.id)
        .then(profile => {
          if (!profile) {
            console.log("Profile missing during periodic check, recreating...")
            forceCreateProfile()
          }
        })
    }, 10000)
    
    return () => clearInterval(intervalId)
  }, [user])

  useEffect(() => {
    const checkSession = async () => {
      // Regular Supabase authentication
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          })
          
          // Ensure user profile exists when session is loaded
          try {
            await ensureUserProfile(session.user.id)
          } catch (err) {
            console.error("Error ensuring profile exists on session check:", err)
          }
        }
      }
      
      setLoading(false)
    }

    // Set up auth state listener (only if Supabase is configured)
    let subscription: { unsubscribe: () => void } | null = null
    
    if (supabase) {
      const result = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          })
          setProfileChecked(false) // Reset profile check on new sign in
          
          // Ensure user profile exists on sign in
          try {
            await ensureUserProfile(session.user.id)
          } catch (err) {
            console.error("Error ensuring profile exists on sign in:", err)
          }
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
    // if (DEV_MODE) {
    //   // Set a development user
    //   setUser({
    //     id: "dev-user-id",
    //     email: email || "dev@example.com",
    //   })
    //   return { error: null }
    // }
    
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
    // if (DEV_MODE) {
    //   // Set a development user
    //   setUser({
    //     id: "dev-user-id",
    //     email: "google-user@example.com",
    //   })
    //   return { error: null }
    // }
    
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
    // if (DEV_MODE) {
    //   // Just clear the user state in development mode
    //   setUser(null)
    //   return
    // }
    
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut, forceCreateProfile }}>
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