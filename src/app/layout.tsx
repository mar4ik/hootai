"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import Script from "next/script"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

// Force redirect component that runs before anything else
function ForceRedirectCheck() {
  return (
    <Script
      id="force-redirect-check"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // EMERGENCY REDIRECT CHECK
              // If on production but should be on localhost, redirect immediately
              if (typeof window !== 'undefined') {
                // Get the current hostname and check if it's localhost
                const hostname = window.location.hostname;
                const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
                
                if (!isLocalhost) {
                  // Check if we have any indication we should be on localhost
                  const hasLocalOrigin = localStorage.getItem('local_origin');
                  const isDevMode = localStorage.getItem('dev_mode') === 'true';
                  const forceRedirect = localStorage.getItem('force_local_redirect') === 'true';
                  
                  // Don't redirect if we're on an auth page (sign-in, sign-up, etc.)
                  const isAuthPage = window.location.pathname.startsWith('/auth/');
                  
                  if ((hasLocalOrigin || isDevMode || forceRedirect) && !isAuthPage) {
                    // Get local origin or fallback to localhost:3000
                    const localOrigin = localStorage.getItem('local_origin') || 
                                      'http://localhost:' + (localStorage.getItem('dev_port') || '3000');
                    
                    // Preserve the current path in the redirect
                    const currentPath = window.location.pathname + window.location.search + window.location.hash;
                    const redirectUrl = localOrigin + currentPath;
                    
                    window.location.href = redirectUrl;
                  }
                }
              }
            } catch (e) {
              // Silently handle errors
            }
          })();
        `
      }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Hoot.ai</title>
        <meta name="description" content="Analyze your data with AI" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <ForceRedirectCheck />
      </head>
      <body className={`${inter.className} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Suspense>
              {children}
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
