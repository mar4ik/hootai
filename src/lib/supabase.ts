import { createClient } from '@supabase/supabase-js'

// Define environment variable types to ensure type safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Add debug console logs for configuration
console.log(`Supabase URL configured: ${supabaseUrl ? 'Yes' : 'No'}`)
console.log(`Supabase key length: ${supabaseAnonKey.length}`)

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

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Add shorter timeouts to fail faster if there are connection issues
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    }
  }
})

