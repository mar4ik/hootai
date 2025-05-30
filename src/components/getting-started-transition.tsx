"use client"

import { useState, useEffect, ReactNode } from "react"
import { usePathname } from "next/navigation"

interface TransitionWrapperProps {
  children: ReactNode
}

export function GettingStartedTransition({ children }: TransitionWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  
  // Show content with a slight delay for the fade-in effect
  useEffect(() => {
    // First render or navigation to this page
    setIsVisible(false)
    
    // Set a timeout to fade in the content
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100) // Short delay for smooth transition
    
    return () => clearTimeout(timer)
  }, [pathname])
  
  return (
    <div 
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: "opacity 250ms ease-in-out",
      }}
    >
      {children}
    </div>
  )
} 