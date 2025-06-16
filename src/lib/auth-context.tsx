"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { ensureUserProfile } from "./user-service"
import { updateLastSignInTime } from "./user-service"

// Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured properly
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
}

// Safe localStorage implementation that checks for browser environment
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Global Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

// Create a function to get Supabase client with proper config
const getSupabaseClient = (): SupabaseClient | null => {
  // Skip during server-side rendering
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing instance if already initialized
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check if we're in development/localhost environment
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // Try to use window environment variables if available (for production fallback)
  const url = typeof window !== 'undefined' && (window as {ENV_SUPABASE_URL?: string}).ENV_SUPABASE_URL 
    ? (window as {ENV_SUPABASE_URL?: string}).ENV_SUPABASE_URL 
    : supabaseUrl;
  
  // Fallback URL for production only - not for localhost
  const fallbackUrl = 'https://eaennrqqtlmanbivdhqm.supabase.co';
  
  // Use fallback if needed, but only in production
  let effectiveUrl = isLocalhost ? url : (url || fallbackUrl);
  
  // Ensure we have a valid URL
  if (!effectiveUrl && isLocalhost) {
    console.warn("Missing Supabase URL for localhost, using fallback URL");
    effectiveUrl = fallbackUrl;
  }
  
  const key = typeof window !== 'undefined' && (window as {ENV_SUPABASE_KEY?: string}).ENV_SUPABASE_KEY
    ? (window as {ENV_SUPABASE_KEY?: string}).ENV_SUPABASE_KEY
    : supabaseAnonKey;
  
  if (!effectiveUrl || !key) {
    console.error("Cannot create Supabase client: missing credentials");
    return null;
  }
  
  // Create client with better options for production environments
  supabaseInstance = createClient(effectiveUrl, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: false, // Disable auto refresh to prevent lock issues
      storageKey: 'supabase.auth.token',
      detectSessionInUrl: false, // Handle manually to prevent redirect issues
      flowType: 'implicit', // Use implicit flow to avoid PKCE issues
      debug: false, // Disable debug to reduce console logs
      storage: safeStorage,
    },
    global: {
      headers: {
        'X-Client-Info': `hootai-webapp/${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`,
      },
    },
  });
  
  return supabaseInstance;
};

// Define types
export type _User = {
  id: string
  email: string | undefined
  role?: string
  app_metadata?: {
    provider?: string
    [key: string]: unknown
  }
  user_metadata?: {
    [key: string]: unknown
  }
  aud?: string
  created_at?: string
}

export type AuthState = {
  user: _User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (password: string) => Promise<void>
  refreshSession: () => Promise<void>
  forceCreateProfile: () => Promise<void>
  reinitializeClient: () => void
}

// Retry function for critical operations
const withRetry = async <T,>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
};

// Create context
const AuthContext = createContext<AuthState | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<_User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_isClient, setIsClient] = useState(false);
  const authListenerRef = useRef<{ data?: { subscription?: any } }>(null);

  // Reinitialize client
  const reinitializeClient = () => {
    supabaseInstance = null;
    getSupabaseClient();
  };

  // Set up auth state listener
  useEffect(() => {
    setIsClient(true);
    
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    // Get Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        if (session) {
          setUser(session.user as _User);
          await checkUserProfile(session.user as _User);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Check and ensure user profile exists
    const checkUserProfile = async (user: _User) => {
      if (!user || !user.id) return;
      
      try {
        await withRetry(async () => {
          await ensureUserProfile(user.id);
          await updateLastSignInTime(user.id);
        });
      } catch (err) {
        console.error('Error ensuring user profile:', err);
      }
    };
    
    // Set up auth state change listener
    const { data } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user as _User);
        await checkUserProfile(session.user as _User);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Clear any cached tokens to prevent refresh attempts
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
        }
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user as _User);
      } else if (event === 'TOKEN_REFRESHED') {
        // No need to update state for token refresh
        // This helps prevent unnecessary re-renders
      }
    });
    
    // Store the listener to clean up later
    authListenerRef.current = { data };
    
    // Check for existing session
    checkSession();
    
    // Clean up the listener on unmount
    return () => {
      if (authListenerRef.current?.data?.subscription) {
        try {
          authListenerRef.current.data.subscription.unsubscribe();
        } catch (e) {
          console.error('Error unsubscribing from auth listener:', e);
        }
      }
    };
  }, []);

  // Force create profile
  const forceCreateProfile = async () => {
    if (!user) return;
    
    try {
      await withRetry(async () => {
        await ensureUserProfile(user.id);
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create user profile');
    }
  };

  // Sign up
  const signUp = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (data?.user) {
        setUser(data.user as _User);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        throw signInError;
      }
      
      if (data?.user) {
        setUser(data.user as _User);
        await withRetry(async () => {
          await ensureUserProfile(data.user.id);
          await updateLastSignInTime(data.user.id);
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    }
  };

  // Sign out
  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    
    try {
      // Clear any environment flags to prevent redirect loops
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dev_mode');
        localStorage.removeItem('force_local_redirect');
        localStorage.removeItem('local_origin');
        localStorage.removeItem('dev_port');
        localStorage.removeItem('supabase.auth.token');
      }
      
      await supabase.auth.signOut();
      setUser(null);
      
      // Redirect to sign-in page - use current origin to stay on same domain
      if (typeof window !== 'undefined') {
        window.location.href = window.location.origin + '/auth/sign-in';
        return;
      }
      
      // Fallback to router if window is not available
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (resetError) {
        throw resetError;
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send password reset email');
    }
  };

  // Reset password
  const resetPassword = async (password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Redirect to home page after password reset - use current origin to stay on same domain
      if (typeof window !== 'undefined') {
        window.location.href = window.location.origin + '/';
        return;
      }
      
      // Fallback to router if window is not available
      router.push('/');
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    }
  };

  // Refresh session
  const refreshSession = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    
    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        throw refreshError;
      }
      
      if (data?.session) {
        setUser(data.session.user as _User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Refresh session error:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh session');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        forgotPassword,
        resetPassword,
        refreshSession,
        forceCreateProfile,
        reinitializeClient,
      }}
    >
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