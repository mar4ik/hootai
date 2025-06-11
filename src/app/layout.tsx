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
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('light');
                document.documentElement.style.colorScheme = 'light';
                
                // Set fallback URL if needed for production
                if (typeof window !== 'undefined' && !window.ENV_SUPABASE_URL) {
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
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6429905,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
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
