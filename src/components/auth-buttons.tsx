"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserAvatar } from "./user-avatar"
import { LogOut, ChevronDown } from "lucide-react"

export function AuthButtons() {
  const { user, loading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Only show on client side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mounted])
  
  // Don't render anything during SSR or when loading
  // This prevents hydration mismatch
  if (!mounted) {
    return (
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
      </div>
    )
  }
  
  // If still loading, show loading state
  if (loading) {
    return (
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    )
  }

  // If user is authenticated, show user menu
  if (user) {
    return (
      <div className="relative user-dropdown">
        <div 
          className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-white/10 transition-colors rounded-md"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <UserAvatar size="sm" />
          <span className="text-sm font-medium hidden md:inline-block">
            {user.email?.split('@')[0] || 'User'}
          </span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>
        
        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-md shadow-lg border z-10">
            <div className="py-1">
              <div className="px-4 py-2 text-sm font-medium border-b">
                {user.email}
              </div>
              <Link 
                href="/profile" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile
              </Link>
              <Link 
                href="/settings" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Settings
              </Link>
              <button 
                onClick={() => {
                  signOut()
                  setIsDropdownOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // If user is not authenticated, show sign in and sign up buttons
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href="/auth/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  )
} 