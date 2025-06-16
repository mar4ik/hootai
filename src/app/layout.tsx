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
                
                // Prevent redirect loops by checking if we've redirected recently
                const lastRedirectTime = parseInt(sessionStorage.getItem('last_redirect_time') || '0');
                const now = Date.now();
                const redirectCooldown = 10000; // 10 seconds
                
                // If we've redirected in the last 10 seconds, don't redirect again
                if (now - lastRedirectTime < redirectCooldown) {
                  // Clear any problematic flags to prevent future redirects
                  localStorage.removeItem('local_origin');
                  localStorage.removeItem('dev_mode');
                  localStorage.removeItem('force_local_redirect');
                  return;
                }
                
                // Don't redirect if we're on an auth page
                const isAuthPage = window.location.pathname.startsWith('/auth/');
                if (isAuthPage) {
                  // Clear any problematic flags to prevent future redirects
                  localStorage.removeItem('local_origin');
                  localStorage.removeItem('dev_mode');
                  localStorage.removeItem('force_local_redirect');
                  return;
                }
                
                // DISABLE ALL REDIRECTS - USERS SHOULD STAY ON THE DOMAIN THEY'RE ON
                // This comment is left here to indicate we've intentionally disabled redirects
                // to prevent issues with authentication
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
