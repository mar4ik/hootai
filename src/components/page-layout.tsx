"use client"

import { Sidebar } from "@/components/sidebar"
import { AuthButtons } from "@/components/auth-buttons"
import { useState, useEffect, ReactNode } from "react"

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768)
      }
      
      // Initial check
      checkScreenSize()
      
      // Add event listener
      window.addEventListener('resize', checkScreenSize)
      
      // Cleanup
      return () => window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Auth buttons - with right alignment for desktop */}
        <div className="w-full sticky top-0 z-10">
          {isMobile ? (
            <div className="fixed z-[55] top-4 right-4 right-16">
              <AuthButtons />
            </div>
          ) : (
            <div className="flex justify-end py-3 px-6">
              <AuthButtons />
            </div>
          )}
        </div>
        
        {/* Main content - scrollable */}
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  )
} 