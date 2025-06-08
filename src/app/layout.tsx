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

// Log environment status in a way that doesn't expose keys
console.log(`[Root Layout] Supabase URL configured: ${supabaseUrl ? 'Yes' : 'No'}`)
console.log(`[Root Layout] Supabase key length: ${supabaseAnonKey.length}`)

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
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('light');
                document.documentElement.style.colorScheme = 'light';
                
                // Check for environment variables
                console.log("Environment check from inline script - has SUPABASE_URL:", 
                  typeof window !== 'undefined' && !!window.ENV_SUPABASE_URL);
                
                // Set fallback URL if needed for production
                if (typeof window !== 'undefined' && !window.ENV_SUPABASE_URL) {
                  console.log("Setting fallback Supabase URL");
                  window.ENV_SUPABASE_URL = "${AUTH_FALLBACK_URL}";
                }
              })()
            `
          }}
        />
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
            
            // Make environment variables available to client-side scripts
            window.ENV_SUPABASE_URL = "${supabaseUrl || AUTH_FALLBACK_URL}";
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
                console.log("Auth state reset");
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
