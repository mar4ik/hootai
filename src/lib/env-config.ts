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
  const dev = isDevelopment();
  const url = dev ? SITE_URLS.development : SITE_URLS.production;
  return url;
};

/**
 * Get the appropriate auth callback URL based on the current environment
 * This is used for OAuth redirects
 */
export const getAuthCallbackUrl = (): string => {
  // Always use /auth/callback as the callback path
  const callbackUrl = `${getSiteUrl()}/auth/callback`;
  return callbackUrl;
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
  
  // Only set force_local_redirect when in development
  if (isLocal) {
    localStorage.setItem('force_local_redirect', 'true');
  }
}; 