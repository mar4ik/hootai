import { createClient } from '@supabase/supabase-js'

// Add types for window globals
declare global {
  interface Window {
    ENV_SUPABASE_URL?: string;
    ENV_HAS_KEYS?: boolean;
    checkAndResetAuth?: () => boolean;
  }
}

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log warning if missing credentials
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseKey)) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

// Check for fallback values from window globals (set in layout.tsx)
let finalSupabaseUrl = supabaseUrl;
if (typeof window !== 'undefined' && !supabaseUrl && window.ENV_SUPABASE_URL) {
  finalSupabaseUrl = window.ENV_SUPABASE_URL;
}

// Detect if we're on a mobile device
const isMobileDevice = typeof window !== 'undefined' && 
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

// Browser-specific configuration
const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return createClient<DatabaseSchema>(finalSupabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'supabase.auth.token',
      detectSessionInUrl: false, // We handle this manually
      debug: process.env.NODE_ENV !== 'production',
    }
  });
}

// Cookie interface for server components
interface CookieInterface {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
  remove: (name: string, options?: Record<string, unknown>) => void;
}

// Create a client for server components
export const createServerClient = (_cookies: CookieInterface) => {
  return createClient<DatabaseSchema>(finalSupabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    }
  });
}

// Default client for browser use
const supabaseClient = typeof window !== 'undefined' ? createBrowserClient() : null;

// Export as both named and default export
export const supabase = supabaseClient;
export default supabaseClient;

