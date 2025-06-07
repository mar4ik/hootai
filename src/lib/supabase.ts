import { createClient } from '@supabase/supabase-js'

// Create a simple Database type placeholder
interface CustomDatabase {}
type Database = CustomDatabase

// Add types for window globals
declare global {
  interface Window {
    ENV_SUPABASE_URL?: string;
    ENV_HAS_KEYS?: boolean;
    checkAndResetAuth?: () => boolean;
  }
}

// Get environment variables with fallbacks
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log warning if missing credentials
if (typeof window !== 'undefined' && (!url || !key)) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

// Add debug console logs for configuration
console.log(`Supabase URL configured: ${url ? 'Yes' : 'No'}`)
console.log(`Supabase key length: ${key.length}`)

// Check for fallback values from window globals (set in layout.tsx)
if (typeof window !== 'undefined' && !url && window.ENV_SUPABASE_URL) {
  console.log("Using fallback Supabase URL from window.ENV_SUPABASE_URL");
  url = window.ENV_SUPABASE_URL;
}

// Detect if we're on a mobile device
const isMobileDevice = typeof window !== 'undefined' && 
  (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  (window.innerWidth < 768));

if (isMobileDevice) {
  console.log("Mobile device detected, adjusting auth configuration");
}

// Type for our database schema
export type Database = {
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

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'supabase.auth.token',
      detectSessionInUrl: false, // We handle this manually
      debug: process.env.NODE_ENV !== 'production',
    },
    global: {
      fetch: (url: string, options: RequestInit) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
          credentials: 'include',
        }).finally(() => clearTimeout(timeoutId));
      }
    }
  });
}

// Cookie interface for server components
interface CookieInterface {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: any) => void;
  remove: (name: string, options?: any) => void;
}

// Create a client for server components
export const createServerClient = (cookies: CookieInterface) => {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    cookies: {
      get: (name: string) => cookies.get(name),
      set: (name: string, value: string, options: any) => {
        cookies.set(name, value, { ...options, path: '/' });
      },
      remove: (name: string, options: any) => {
        cookies.set(name, '', { ...options, path: '/', maxAge: 0 });
      },
    },
  });
}

// Default client for browser use
const supabase = typeof window !== 'undefined' ? createBrowserClient() : null;

export default supabase;

