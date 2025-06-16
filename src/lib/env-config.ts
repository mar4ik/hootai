/**
 * Environment configuration for the application
 * Handles different environments (development, production) and provides
 * environment-specific values for URLs, etc.
 */

// Site URLs for different environments
export const SITE_URLS = {
  development: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  production: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hootai.am',
};

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eaennrqqtlmanbivdhqm.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

/**
 * Detect if we're running in a development environment
 */
export const isDevelopment = (): boolean => {
  // Check for localhost or 127.0.0.1
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  
  // In SSR context, use NODE_ENV
  return process.env.NODE_ENV === 'development';
};

/**
 * Get the appropriate site URL based on the current environment
 */
export const getSiteUrl = (): string => {
  // CRITICAL: Always use the current origin if available
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback to environment-specific URL if not in browser
  const dev = isDevelopment();
  const url = dev ? SITE_URLS.development : SITE_URLS.production;
  return url;
};

/**
 * Get the appropriate auth callback URL based on the current environment
 * This is used for OAuth redirects
 */
export const getAuthCallbackUrl = (): string => {
  // CRITICAL: Always use the current origin for the callback URL to prevent cross-domain redirects
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/capture`;
  }
  
  // Fallback to environment-specific URL if not in browser
  const siteUrl = getSiteUrl();
  return `${siteUrl}/auth/capture`;
};

/**
 * Store environment information in localStorage for use in callbacks
 * This helps when redirecting between environments
 */
export const storeEnvironmentInfo = (): void => {
  if (typeof window === 'undefined') return;
  
  const isLocal = isDevelopment();
  localStorage.setItem('dev_mode', isLocal ? 'true' : 'false');
  localStorage.setItem('local_origin', window.location.origin);
  localStorage.setItem('dev_port', window.location.port || '3000');
  
  // CRITICAL: Always force redirect to the current origin
  localStorage.setItem('force_local_redirect', 'true');
}; 