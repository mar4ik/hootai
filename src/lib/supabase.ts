import { createClient } from '@supabase/supabase-js'

// Add types for window globals
declare global {
  interface Window {
    ENV_SUPABASE_URL?: string;
    ENV_HAS_KEYS?: boolean;
    checkAndResetAuth?: () => boolean;
    supabaseClientInstance?: any; // Store the client instance globally
  }
}

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in development/localhost environment
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Log warning if missing credentials
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

// CRITICAL: Always use the environment-specific Supabase URL
// For localhost, ensure we're using the URL from .env.local
const finalSupabaseUrl = supabaseUrl;

// Detect if we're on a mobile device
const _isMobileDevice = typeof window !== 'undefined' && 
  (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  (window.innerWidth < 768));

// Type for our database schema
export type DatabaseSchema = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          preferences: { [key: string]: unknown } | null
          last_sign_in: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          preferences?: { [key: string]: unknown } | null
          last_sign_in?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          preferences?: { [key: string]: unknown } | null
          last_sign_in?: string | null
          updated_at?: string
        }
      },
      user_analyses: {
        Row: { 
          id: string
          user_id: string 
          content_type: 'url' | 'file'
          content: string
          file_name?: string
          created_at: string
        }
        Insert: { 
          id?: string
          user_id: string 
          content_type: 'url' | 'file'
          content: string
          file_name?: string
          created_at?: string
        }
        Update: { 
          content_type?: 'url' | 'file'
          content?: string
          file_name?: string
        }
      }
    }
  }
}

// Custom storage implementation to prevent lock issues
const customStorage = {
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

// Browser-specific configuration
const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if we already have a client instance
  if (typeof window !== 'undefined' && window.supabaseClientInstance) {
    return window.supabaseClientInstance;
  }

  // Double-check that we have credentials before creating client
  if (!finalSupabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials during client creation');
    return null;
  }
  
  try {
    const client = createClient<DatabaseSchema>(finalSupabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // Disable auto refresh to prevent lock issues
        storageKey: 'supabase.auth.token',
        detectSessionInUrl: false, // We handle this manually
        debug: isLocalhost,
        storage: customStorage // Use custom storage to prevent lock issues
      },
      global: {
        headers: {
          'X-Client-Info': `hootai-webapp/${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`,
        },
      },
    });
    
    // Store the client instance globally to avoid multiple initializations
    if (typeof window !== 'undefined') {
      window.supabaseClientInstance = client;
      
      // Add a custom event listener to detect auth state changes
      // This helps prevent excessive token refresh attempts
      if (client.auth) {
        client.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_OUT') {
            // Clear any cached tokens to prevent refresh attempts
            localStorage.removeItem('supabase.auth.token');
            // Also clear environment flags
            localStorage.removeItem('dev_mode');
            localStorage.removeItem('local_origin');
            localStorage.removeItem('dev_port');
            localStorage.removeItem('force_local_redirect');
          }
        });
      }
    }
    
    return client;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

// Cookie interface for server components
interface CookieInterface {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
  remove: (name: string, options?: Record<string, unknown>) => void;
}

// Create a client for server components
export const createServerClient = (_cookies: CookieInterface) => {
  // Double-check that we have credentials before creating client
  if (!finalSupabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials during server client creation');
    return null;
  }

  try {
    return createClient<DatabaseSchema>(finalSupabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // Disable auto refresh for server components
        detectSessionInUrl: false
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase server client:', error);
    return null;
  }
}

// Default client for browser use
const supabaseClient = typeof window !== 'undefined' ? createBrowserClient() : null;

// Export as both named and default export
export const supabase = supabaseClient;
export default supabaseClient;

