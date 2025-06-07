import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    
    // Debug full URL and all parameters - for server logs only
    console.log("Auth callback URL:", request.url)
    console.log("Search params:", Object.fromEntries(requestUrl.searchParams.entries()))
    
    // Check for error parameters
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    
    if (error) {
      console.error("OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/auth/sign-in?error=${encodeURIComponent(errorDescription || error)}`, 
        requestUrl.origin)
      )
    }
    
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase credentials");
      return NextResponse.redirect(new URL('/auth/sign-in?error=' + encodeURIComponent("Server configuration error"), requestUrl.origin));
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true // This is important to capture auth data from URL
      }
    });
    
    // Try to get session from URL
    try {
      console.log("Checking for session in URL...");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        return NextResponse.redirect(new URL('/auth/sign-in?error=' + encodeURIComponent(error.message), requestUrl.origin));
      }
      
      if (!data?.session) {
        console.error("No session found in URL");
        
        // Special case: Check if we have a hash fragment
        const responseUrl = new URL('/auth/capture', requestUrl.origin);
        
        // Pass along any query parameters
        requestUrl.searchParams.forEach((value, key) => {
          responseUrl.searchParams.append(key, value);
        });
        
        console.log("Redirecting to capture page to handle hash fragment");
        return NextResponse.redirect(responseUrl);
      }
      
      console.log("Session found with user ID:", data.session.user.id);
      
      // Create response with session cookies
      const response = NextResponse.redirect(new URL('/', requestUrl.origin));
      
      // Set cookies to help with auth state persistence
      response.cookies.set('auth_success', 'true', { 
        maxAge: 60 * 5,
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      response.cookies.set('user_id', data.session.user.id, { 
        maxAge: 60 * 5,
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return response;
    } catch (error) {
      console.error("Unexpected error processing session:", error);
      return NextResponse.redirect(new URL('/auth/sign-in?error=' + encodeURIComponent("Session processing error"), requestUrl.origin));
    }
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    return NextResponse.redirect(new URL('/auth/sign-in?error=' + encodeURIComponent("Internal server error"), new URL(request.url).origin));
  }
} 