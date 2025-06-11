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

// Create a function to get Supabase client with proper config
const getSupabaseClient = () => {
  // Skip during server-side rendering
  if (typeof window === 'undefined') {
    // During SSR, return null or a minimal client that will be replaced on client-side
    return null;
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
  
  // If in local development, force use the debug flag and log the URL being used
  if (isLocalhost) {
    console.log(`Creating Supabase client for localhost using URL: ${effectiveUrl}`);
  }
  
  // More robust client creation with better options for production environments
  return createClient(effectiveUrl, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'supabase.auth.token',
      detectSessionInUrl: true,
      flowType: 'implicit',
      debug: typeof window !== 'undefined' && window.location.hostname === 'localhost',
      storage: safeStorage,
    },
    global: {
      headers: {
        'X-Client-Info': `hootai-webapp/${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`,
      },
    },
  });
};

// Lazy initialize Supabase client to avoid SSR issues
let supabase: ReturnType<typeof getSupabaseClient> = null;

// Function to get or initialize the client
const getOrInitClient = () => {
  // Check if we're in a local environment
  const isLocalEnvironment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1');
  
  // For localhost, reinitialize the client every time to avoid using cached values
  if (isLocalEnvironment && supabase) {
    // Force reinitialize for localhost to avoid any caching issues
    supabase = null;
  }
  
  if (typeof window !== 'undefined' && !supabase) {
    supabase = getSupabaseClient();
    
    // For local environment, log the client creation
    if (isLocalEnvironment) {
      console.log('Initialized Supabase client for local environment');
    }
  }
  return supabase;
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
  const [isClient, setIsClient] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const [sessionCheckTimeoutId, setSessionCheckTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Reinitialize client
  const reinitializeClient = () => {
    supabase = getSupabaseClient();
    // Reset state
    setError(null);
    setInitAttempts(prev => prev + 1);
  };

  // Initialize after render to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    // Initialize Supabase client on the client side
    if (!supabase) {
      supabase = getSupabaseClient();
    }
  }, []);

  // Set up periodic session checks
  useEffect(() => {
    if (!isClient || !user) return;
    
    // Create a separate function that has its own scope with the current supabase instance
    const setupSessionCheck = () => {
      // Get the client
      const client = getOrInitClient();
      
      // Only proceed if we have a client
      if (!client) {
        console.warn("No Supabase client available for session checks");
        return () => {}; // Return empty cleanup function
      }
      
      // At this point, client is guaranteed to be non-null in this closure
      const checkSession = async () => {
        try {
          const { data, error } = await client.auth.getSession();
          const session = data?.session;
          
          if (error) {
            console.warn("Session check error:", error.message);
            return;
          }
          
          if (!session) {
            console.warn("Session expired or not found during periodic check");
            setUser(null);
          }
        } catch (err) {
          console.error("Unexpected error in session check:", err);
        }
      };
      
      // Check session every 5 minutes
      const intervalId = setInterval(checkSession, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    };
    
    // Call the setup function and get the cleanup
    const cleanupFunction = setupSessionCheck();
    
    // Return the cleanup function
    return cleanupFunction;
  }, [isClient, user]);

  // Set up initial auth state and listeners
  useEffect(() => {
    if (!isClient) return;
    
    // Clear previous timeout if it exists
    if (sessionCheckTimeoutId) {
      clearTimeout(sessionCheckTimeoutId);
    }
    
    const checkAuthAndProfile = async () => {
      try {
        // Get current client
        const client = getOrInitClient();
        
        if (!client) {
          console.error("No Supabase client available in AuthProvider");
          
          // Set a timeout to retry client initialization
          const timeoutId = setTimeout(() => {
            if (initAttempts < 3) {
              reinitializeClient();
            } else {
              setError("Unable to initialize authentication. Please try refreshing the page.");
              setLoading(false);
            }
          }, 2000);
          
          setSessionCheckTimeoutId(timeoutId);
          return;
        }

        // Get the current session with retry
        const { data: { session }, error } = await withRetry(
          () => client.auth.getSession(),
          3,
          1000
        );

        if (error) {
          console.error("Error getting session:", error.message);
          setError(error.message);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Convert Supabase user to our User type
          const userData: _User = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            app_metadata: session.user.app_metadata,
            user_metadata: session.user.user_metadata,
            aud: session.user.aud,
            created_at: session.user.created_at
          };

          setUser(userData);
          
          // Ensure user profile exists with retry
          try {
            await withRetry(
              () => ensureUserProfile(userData.id),
              3,
              1500
            );
          } catch (profileErr) {
            console.error("Failed to ensure user profile after retries:", profileErr);
            // Don't fail authentication just because profile creation failed
            // User can try manual profile repair later
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Unexpected error in checkAuthAndProfile:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    // Initial auth check
    checkAuthAndProfile();

    // Set up auth listener with null check for client
    const client = getOrInitClient();
    if (!client) {
      console.error("Cannot set up auth listener: No Supabase client available");
      return () => {};
    }
    
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Convert Supabase user to our User type
          const userData: _User = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            app_metadata: session.user.app_metadata,
            user_metadata: session.user.user_metadata,
            aud: session.user.aud,
            created_at: session.user.created_at
          };

          setUser(userData);
          setError(null); // Clear any previous errors

          // Ensure user profile exists on sign-in
          if (event === 'SIGNED_IN') {
            try {
              await withRetry(
                () => ensureUserProfile(userData.id),
                3,
                1500
              );
            } catch (profileErr) {
              console.error("Failed to create profile after sign-in:", profileErr);
              // Still keep the user signed in, they can try profile repair later
            }
          }
        } else {
          setUser(null);
        }
      }
    ) || { data: { subscription: null } };

    // Clean up subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      
      if (sessionCheckTimeoutId) {
        clearTimeout(sessionCheckTimeoutId);
      }
    };
  }, [isClient, router, initAttempts, sessionCheckTimeoutId]);

  // Force create profile
  const forceCreateProfile = async () => {
    if (!user) {
      console.error("No user to create profile for");
      return;
    }

    try {
      await withRetry(
        () => ensureUserProfile(user.id),
        5,  // More retries for explicit user action
        1500
      );
    } catch (err) {
      console.error("Error creating profile:", err);
      throw err;
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      const client = getOrInitClient();
      if (!client) throw new Error("Supabase client not available");
      
      setLoading(true);
      
      const { error } = await client.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error signing up:", err);
      setError(err instanceof Error ? err.message : "An error occurred during sign up");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const client = getOrInitClient();
      if (!client) throw new Error("Supabase client not available");
      
      setLoading(true);
      setError(null); // Clear previous errors
      
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Set a cookie to indicate successful auth (for debugging)
      document.cookie = `auth_success=true; path=/; max-age=86400`;
      
      // Redirect to the home page
      router.push('/');
    } catch (err) {
      console.error("Error signing in:", err);
      setError(err instanceof Error ? err.message : "An error occurred during sign in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const client = getOrInitClient();
      if (!client) throw new Error("Supabase client not available");
      
      setLoading(true);
      
      const { error } = await client.auth.signOut();
      
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      
      // Clear all authentication-related cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name] = cookie.split('=').map(part => part.trim());
        if (name.startsWith('sb-') || name.includes('supabase') || name === 'auth_success' || name === 'user_id') {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
        }
      }
      
      // Clear local storage items related to Supabase, but preserve analysis data
      if (typeof localStorage !== 'undefined') {
        // Find all Supabase related items
        const itemsToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Skip the analysis storage key to preserve user analysis data
          if (key && (key.includes('supabase') || key.includes('sb-')) && !key.includes('hootai-analysis-storage')) {
            itemsToRemove.push(key);
          }
        }
        
        // Remove them
        itemsToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      // Clear session storage items related to authentication
      if (typeof sessionStorage !== 'undefined') {
        // Find all auth-related items
        const sessionItemsToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
            sessionItemsToRemove.push(key);
          }
        }
        
        // Remove them
        sessionItemsToRemove.forEach(key => {
          sessionStorage.removeItem(key);
        });
      }
      
      // Redirect to the main page instead of sign-in
      router.push('/');
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err instanceof Error ? err.message : "An error occurred during sign out");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      const client = getOrInitClient();
      if (!client) throw new Error("Supabase client not available");
      
      setLoading(true);
      
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
    } catch (err) {
      console.error("Error in forgot password:", err);
      setError(err instanceof Error ? err.message : "An error occurred during password reset");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (password: string) => {
    try {
      const client = getOrInitClient();
      if (!client) throw new Error("Supabase client not available");
      
      setLoading(true);
      
      const { error } = await client.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      // Redirect to the sign in page
      router.push('/auth/sign-in');
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err instanceof Error ? err.message : "An error occurred during password reset");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh session function
  const refreshSession = async () => {
    try {
      const client = getOrInitClient();
      if (!client) throw new Error("Supabase client not available");
      
      setLoading(true);
      
      const { error } = await client.auth.refreshSession();
      
      if (error) throw error;
      
      // Verify we have a valid session after refresh
      const { data: { session } } = await client.auth.getSession();
      
      if (!session) {
        throw new Error("Session refresh failed - no valid session found");
      }
    } catch (err) {
      console.error("Error refreshing session:", err);
      setError(err instanceof Error ? err.message : "An error occurred during session refresh");
      
      // Try to reinitialize the client as a last resort
      reinitializeClient();
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context
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

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 