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
  title: "Hoot.ai - UX/UI Analysis Tool",
  description: "Unlock UX Insights Instantly with Hoot.ai",
  icons: {
    icon: [
      { url: '/owl-favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ]
  }
}

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
