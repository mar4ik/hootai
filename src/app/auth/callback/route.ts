import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Parse URL and get query parameters
    const requestUrl = new URL(request.url)
    
    // Check for errors from OAuth provider
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    
    if (error) {
      console.error("OAuth error:", error, errorDescription)
      return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent(errorDescription || error)}`)
    }
    
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent('Configuration error')}`)
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
    
    // Try to get session from URL
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error getting session:", error)
        throw error
      }
      
      if (!data.session) {
        console.error("No session found in URL")
        
        // Check for code parameter (PKCE flow)
        const code = requestUrl.searchParams.get('code')
        
        if (!code) {
          return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent('No authentication code found')}`)
        }
        
        // Try to exchange code for session
        try {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error("Error exchanging code for session:", exchangeError)
            return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent('Authentication failed')}`)
          }
          
          if (!exchangeData.session) {
            return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent('No session created')}`)
          }
          
          // Get provider from session
          const _provider = exchangeData.session.user?.app_metadata?.provider || 'unknown'
          
          // Determine site URL for redirect
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
          
          // Create response with redirect
          const response = NextResponse.redirect(siteUrl)
          
          // Set cookies for server-side auth
          response.cookies.set('sb-access-token', exchangeData.session.access_token, { 
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 // 1 hour
          })
          
          // Set user ID cookie for convenience
          response.cookies.set('user_id', exchangeData.session.user.id, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          })
          
          // Set auth success flag
          response.cookies.set('auth_success', 'true', {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 1 day
          })
          
          // Return the response with cookies
          return response
        } catch (exchangeErr) {
          console.error("Error during code exchange:", exchangeErr)
          return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent('Authentication failed')}`)
        }
      }
      
      // Check for hash fragment (implicit flow)
      // For hash fragments, we need special handling because they're not sent to the server
      // We'll redirect to a client-side handler that can process the hash
      if (requestUrl.hash || requestUrl.searchParams.has('type') && requestUrl.searchParams.get('type') === 'recovery') {
        // Redirect to capture page to handle hash fragment
        return NextResponse.redirect(`${requestUrl.origin}/auth/capture${requestUrl.search}${requestUrl.hash}`)
      }
      
      // If we have a session directly, use it
      if (data.session) {
        // Determine site URL for redirect
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
        
        // Create response with redirect
        const response = NextResponse.redirect(siteUrl)
        
        // Set cookies for server-side auth
        response.cookies.set('sb-access-token', data.session.access_token, { 
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 // 1 hour
        })
        
        // Set user ID cookie for convenience
        response.cookies.set('user_id', data.session.user.id, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        
        // Set auth success flag
        response.cookies.set('auth_success', 'true', {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 // 1 day
        })
        
        // Return the response with cookies
        return response
      }
    } catch (error) {
      console.error("Unexpected error processing session:", error)
    }
    
    // If we get here, something went wrong
    return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent('Authentication failed')}`)
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent('An unexpected error occurred')}`)
  }
} 