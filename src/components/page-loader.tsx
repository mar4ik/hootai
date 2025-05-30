"use client"

import { useEffect, useState } from "react"

interface PageLoaderProps {
  isLoading?: boolean
}

export function PageLoader({ isLoading = true }: PageLoaderProps) {
  const [visible, setVisible] = useState(false)
  
  // Add a slight delay before showing the loader to prevent flashing
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setVisible(true)
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [isLoading])
  
  if (!visible) return null
  
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  )
} 