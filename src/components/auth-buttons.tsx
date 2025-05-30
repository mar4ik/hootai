"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { UserAvatar } from "@/components/user-avatar"
import { LogOut, User, ChevronDown } from "lucide-react"

export function AuthButtons() {
  const { user, signOut, loading } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Handle window resize
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (loading) {
    return null
  }

  if (user) {
    if (isMobile) {
      return (
        <div ref={dropdownRef} className="relative">
          <div 
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity p-2"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <UserAvatar size="sm" showOwl={false} />
            <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
          </div>
          
          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 z-[100] origin-top-right animate-in zoom-in-95 duration-100 bg-white rounded-md shadow-lg border">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-500 border-b truncate">
                  {user.email}
                </div>
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    signOut()
                    setIsDropdownOpen(false)
                  }} 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div ref={dropdownRef} className="relative">
        <div 
          className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-white/100 transition-colors"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <UserAvatar size="sm" showOwl={false} />
          <span className="text-sm truncate max-w-[120px]">
            {user.email}
          </span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>
        
        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-[100] origin-top-right animate-in zoom-in-95 duration-100">
            <div className="py-1">
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                <User size={16} />
                <span>Profile</span>
              </Link>
              <button 
                onClick={() => {
                  signOut()
                  setIsDropdownOpen(false)
                }} 
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        <Link href="/auth/sign-in" className="w-full">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/auth/sign-up" className="w-full">
          <Button 
            variant="default" 
            size="sm"
            className="w-full"
          >
            Sign Up
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-1">
      <Link href="/auth/sign-in">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
      <Link href="/auth/sign-up">
        <Button variant="default" size="sm">
          Sign Up
        </Button>
      </Link>
    </div>
  )
} 