"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ensureUserProfile } from "./user-service"

// Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured properly
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
}

// We create a fresh Supabase client in each function rather than reusing a global instance

type User = {
  id: string
  email: string
  avatar_url?: string
} | null

type AuthContextType = {
  user: User
  loading: boolean
  signIn: (email: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  forceCreateProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const [profileChecked, setProfileChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      try {
        // Always create a fresh client for each check
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
          }
        });
        
        // Check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setUser(null);
        } else if (data?.session) {
          // Map user data to our format
          const { id, email, user_metadata } = data.session.user;
          setUser({
            id,
            email: email || '',
            avatar_url: user_metadata?.avatar_url,
          });
          console.log("Found active session for user:", id);
          
          // Ensure user profile exists
          try {
            await ensureUserProfile(id);
            setProfileChecked(true);
          } catch (err) {
            console.error("Error ensuring profile exists:", err);
          }
        } else {
          console.log("No active session found");
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    checkSession();
    
    // Set up an event listener for auth state changes
    const { data: { subscription } } = createClient(supabaseUrl, supabaseAnonKey)
      .auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
          const { id, email, user_metadata } = session.user;
          setUser({
            id,
            email: email || '',
            avatar_url: user_metadata?.avatar_url,
          });
          console.log("User signed in:", id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          console.log("User signed out");
        }
      });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Ensure loading state resolves even if there's an issue
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading state timed out after 5 seconds, forcing resolution");
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Force create a profile for the current user - can be called anywhere in the app
  const forceCreateProfile = async () => {
    if (!user) return;
    
    try {
      console.log("Force creating profile for user:", user.id);
      await ensureUserProfile(user.id);
      setProfileChecked(true);
    } catch (err) {
      console.error("Error in force profile creation:", err);
    }
  };

  // Add a new effect to ensure profile exists when user is loaded
  useEffect(() => {
    if (user && !profileChecked) {
      console.log("Checking if profile exists for user:", user.id);
      ensureUserProfile(user.id)
        .then(() => {
          console.log("Profile check complete");
          setProfileChecked(true);
        })
        .catch(err => {
          console.error("Error checking profile:", err);
          setProfileChecked(true); // Mark as checked even on error to avoid repeated attempts
        });
    }
    
    console.log("Auth Provider - Loading state:", loading);
  }, [user, loading, profileChecked]);

  const signIn = async (email: string) => {
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        return { error };
      } catch (err) {
        console.error("Error during email sign-in:", err);
        return { 
          error: err instanceof Error ? err : new Error("Unknown error during email sign-in") 
        };
      }
    }
    
    return { 
      error: new Error("Supabase is not configured properly. Check your environment variables.")
    };
  };

  const signInWithGoogle = async () => {
    // Regular Supabase sign-in with Google
    if (supabaseUrl) {
      try {
        console.log("Starting Google OAuth flow with DIRECT browser redirect...");
        
        // Get the Supabase Google OAuth URL directly
        const redirectUrl = `${window.location.origin}/auth/callback`;
        const googleAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}&prompt=select_account`;
        
        console.log("Redirecting directly to:", googleAuthUrl);
        
        // Force a direct browser redirect to bypass Supabase JS client
        window.location.href = googleAuthUrl;
        
        // We don't actually return since we're redirecting
        return { error: null };
      } catch (err) {
        console.error("Unexpected error during Google sign-in:", err);
        return { 
          error: err instanceof Error ? err : new Error("Unknown error during Google sign-in") 
        };
      }
    }
    
    // If Supabase is not configured, return a configuration error
    return { 
      error: new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.") 
    };
  };

  const signOut = async () => {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      await supabase.auth.signOut();
      
      // Clear any persistent storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth.refreshToken');
        localStorage.removeItem('supabase.auth.accessToken');
        
        // Clear all cookies
        document.cookie.split(';').forEach(c => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
      }
      
      setUser(null);
      setProfileChecked(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshSession = async () => {
    setLoading(true);
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session refresh error:", error);
        setUser(null);
        router.push('/auth/sign-in');
        return;
      }
      
      if (data?.session) {
        const { id, email, user_metadata } = data.session.user;
        setUser({
          id,
          email: email || '',
          avatar_url: user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
        router.push('/auth/sign-in');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
      router.push('/auth/sign-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut, refreshSession, forceCreateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 