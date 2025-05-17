import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

// Define environment variable types to ensure type safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Type for our database schema
export type Database = {
  // You can define your database schema types here
  // For example:
  // public: {
  //   Tables: {
  //     users: {
  //       Row: { id: string; name: string; email: string }
  //       Insert: { id?: string; name: string; email: string }
  //       Update: { id?: string; name?: string; email?: string }
  //     }
  //   }
  // }
}

// Helper for creating a Supabase client for server-side operations with cookies
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Helper for creating a Supabase client in browser contexts
export function createClientSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Regular Supabase client without cookies - useful for non-auth operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

