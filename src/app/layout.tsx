import type React from "react"
import type { Metadata } from "next"
import { Inter, Istok_Web } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { PageTransition } from "@/components/page-transition"
import { NavigationProgress } from "@/components/navigation-progress"

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
      </head>
      <body className={`${inter.className} ${istokWeb.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <NavigationProgress />
            <PageTransition>
              {children}
            </PageTransition>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
