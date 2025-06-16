import type React from "react"
import type { Metadata } from "next"
import { Inter, Istok_Web } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })
const istokWeb = Istok_Web({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-istok',
})

export const metadata: Metadata = {
  title: "Hoot.ai - AI-Powered UX Analysis Tool | Actionable User Journey Insights",
  description: "Start optimizing your product experience in minutes with Hoot.ai. Upload CSV/PDF files with user journey data or enter your website URL for instant AI-powered UX insights. No code or setup required.",
  keywords: "UX analysis tool, AI UX insights, user journey optimization, product experience, friction points detection, no-code UX analytics, website usability insights, user behavior analysis, Hoot.ai, actionable UX insights",
  icons: {
    icon: [
      { url: '/owl-favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ]
  }
}

// Check environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Special fallback for development
const AUTH_FALLBACK_URL = 'https://eaennrqqtlmanbivdhqm.supabase.co';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/owl-favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        {/* Immediate redirect script - will run before anything else */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // PREVENT PRODUCTION ACCESS IN DEV MODE
                  
                  // When on localhost, store flags
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log("🏠 Running on localhost - setting dev flags");
                    localStorage.setItem('dev_mode', 'true');
                    localStorage.setItem('dev_port', window.location.port || '3000');
                    localStorage.setItem('local_origin', window.location.origin);
                    localStorage.setItem('force_local_redirect', 'true');
                  }
                  
                  // If we're on the production site but in dev mode, redirect back to localhost
                  if ((window.location.hostname === 'www.hootai.am' || window.location.hostname === 'hootai.am') && 
                      (localStorage.getItem('dev_mode') === 'true' || localStorage.getItem('force_local_redirect') === 'true')) {
                    
                    console.log("🛑 PRODUCTION SITE DETECTED WHEN IN DEV MODE - REDIRECTING TO LOCALHOST");
                    
                    // Get local development origin - fallback to port 3000
                    const port = localStorage.getItem('dev_port') || '3000';
                    const localOrigin = localStorage.getItem('local_origin') || ('http://localhost:' + port);
                    
                    // Check if we're in an auth callback with parameters
                    const hasAuthParams = window.location.search.includes('code=') || 
                                         window.location.search.includes('token=') || 
                                         window.location.search.includes('access_token=') ||
                                         window.location.hash.includes('access_token=');
                    
                    // Auth callback requires special handling - redirect with all parameters
                    if (hasAuthParams) {
                      console.log('🔄 Auth callback detected on production - redirecting to localhost');
                      
                      // Build the redirect URL
                      let redirectPath = window.location.pathname;
                      if (!redirectPath.includes('/auth/login-callback')) {
                        // Force redirect to login-callback endpoint
                        redirectPath = '/auth/login-callback';
                      }
                      
                      const redirectUrl = localOrigin + redirectPath + 
                                        window.location.search + window.location.hash;
                      
                      console.log('🔄 Redirecting to: ' + redirectUrl);
                      
                      // Force redirect to localhost without checking for redirect loops
                      window.location.href = redirectUrl;
                      return; // Stop execution to prevent any further processing
                    } else {
                      // Regular page - redirect to localhost home
                      console.log('🔄 Redirecting to localhost home');
                      window.location.href = localOrigin + '/';
                      return; // Stop execution to prevent any further processing
                    }
                  }
                } catch (e) {
                  console.error('Error in immediate redirect check:', e);
                }
              })();
            `
          }}
        />
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('light');
                document.documentElement.style.colorScheme = 'light';
                
                // Set fallback URL if needed for production, but not on localhost
                if (typeof window !== 'undefined' && !window.ENV_SUPABASE_URL && 
                    window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1') {
                  window.ENV_SUPABASE_URL = "${AUTH_FALLBACK_URL}";
                }
              })()
            `
          }}
        />
        {/* Hotjar Tracking Code */}
        <Script id="hotjar" strategy="afterInteractive">
            {`
              (function(h,o,t,j,a,r){
                // Save any existing analysis data before Hotjar loads
                const preserveStorageKey = 'hootai-analysis-storage-v2';
                let savedAnalysisData = null;
                
                try {
                  const analysisDataStr = localStorage.getItem(preserveStorageKey);
                  if (analysisDataStr) {
                    savedAnalysisData = analysisDataStr;
                  }
                } catch (e) {
                  console.error('Error preserving analysis data before Hotjar:', e);
                }
                
                // Initialize Hotjar
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6429905,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
                
                // Restore analysis data after Hotjar initialization
                setTimeout(function() {
                  try {
                    if (savedAnalysisData) {
                      localStorage.setItem(preserveStorageKey, savedAnalysisData);
                    }
                  } catch (e) {
                    console.error('Error restoring analysis data after Hotjar:', e);
                  }
                }, 500);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `}
          </Script>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1NXXGW8Z77"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1NXXGW8Z77');
            
            // Development mode flag setup
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocalhost) {
              localStorage.setItem('dev_mode', 'true');
              localStorage.setItem('dev_port', window.location.port || '3000');
              
              // Add an event listener to intercept and log navigations
              const originalPushState = history.pushState;
              const originalReplaceState = history.replaceState;
              
              history.pushState = function() {
                console.log('Navigation intercepted:', arguments);
                // Check if trying to navigate to production
                const url = arguments[2];
                if (typeof url === 'string' && (url.includes('hootai.am') || url.includes('www.hootai.am'))) {
                  console.warn('Prevented navigation to production site:', url);
                  // Modify the URL to stay on localhost
                  arguments[2] = url.replace(/https?:\\/\\/(?:www\\.)?hootai\\.am/, window.location.origin);
                }
                return originalPushState.apply(this, arguments);
              };
              
              history.replaceState = function() {
                console.log('Replace state intercepted:', arguments);
                // Check if trying to navigate to production
                const url = arguments[2];
                if (typeof url === 'string' && (url.includes('hootai.am') || url.includes('www.hootai.am'))) {
                  console.warn('Prevented replace state to production site:', url);
                  // Modify the URL to stay on localhost
                  arguments[2] = url.replace(/https?:\\/\\/(?:www\\.)?hootai\\.am/, window.location.origin);
                }
                return originalReplaceState.apply(this, arguments);
              };
            }
            
            // Make environment variables available to client-side scripts
            // Check if we're in development mode
            const effectiveSupabaseUrl = isLocalhost ? "${supabaseUrl}" : "${supabaseUrl || AUTH_FALLBACK_URL}";
            
            window.ENV_SUPABASE_URL = effectiveSupabaseUrl;
            window.ENV_HAS_KEYS = ${Boolean(supabaseUrl && supabaseAnonKey)};
            
            // Production fallback helper function
            window.checkAndResetAuth = function() {
              try {
                localStorage.removeItem('supabase.auth.token');
                document.cookie.split(";").forEach(function(c) {
                  document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                return true;
              } catch(e) {
                console.error("Failed to reset auth:", e);
                return false;
              }
            };
          `}
        </Script>
      </head>
      <body className={`${inter.className} ${istokWeb.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
