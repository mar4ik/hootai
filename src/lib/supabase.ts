import { createClient } from '@supabase/supabase-js'

// Define environment variable types to ensure type safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Type for our database schema
export type Database = {
  public: {
    Tables: {
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
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

