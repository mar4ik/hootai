import type React from "react"
import type { Metadata } from "next"
import { Inter, Istok_Web } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })
const istokWeb = Istok_Web({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-istok',
})

export const metadata: Metadata = {
  title: "Hoot.ai - UX/UI Analysis Tool",
  description: "Unlock UX Insights Instantly with Hoot.ai",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${istokWeb.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
