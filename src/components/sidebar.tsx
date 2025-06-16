"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  
  // Handle window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Check on mount
    checkScreenSize()
    
    // Add event listener
    window.addEventListener("resize", checkScreenSize)
    
    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && isMobile && !target.closest('.sidebar-content') && !target.closest('.sidebar-toggle')) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, isMobile])
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobile) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, isMobile])

  // Helper function to determine if a link is active
  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Helper function to get the appropriate class names for a link
  const getLinkClassName = (href: string) => {
    const baseClasses = "flex items-center gap-2 p-3 rounded-md transition-colors"
    const activeClasses = "bg-muted/50 text-primary font-medium"
    const inactiveClasses = "hover:bg-muted/50"
    
    return `${baseClasses} ${isLinkActive(href) ? activeClasses : inactiveClasses}`
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="sidebar-toggle md:hidden fixed top-4 right-4 z-[60] p-2 rounded-md bg-background shadow-md border"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[45]" onClick={() => setIsOpen(false)} />
      )}
      
      {/* Sidebar content */}
      <div 
        className={`sidebar-content h-full w-64 border-r bg-background flex flex-col md:sticky md:top-0 ${
          isMobile ? 'fixed inset-y-0 left-0 z-[50] transition-transform duration-300' : ''
        } ${
          isOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => isMobile && setIsOpen(false)}>
              <Image 
                src="/owl-favicon.svg" 
                alt="Hoot.ai Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8"
                priority 
              />
              <span>Hoot.ai</span>
            </Link>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/"
            className={getLinkClassName("/")}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">🚀</span>
            <span>Getting started</span>
          </Link>
          <Link
            href="/what-is-next"
            className={getLinkClassName("/what-is-next")}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">🍀</span>
            <span>What is coming next?</span>
          </Link>
          <Link 
            href="/about" 
            className={getLinkClassName("/about")}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">🤔</span>
            <span>About Hoot.ai</span>
          </Link>
          <Link
            href="/wall-of-fame"
            className={getLinkClassName("/wall-of-fame")}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">❤️</span>
            <span>Wall of fame</span>
          </Link>
          <Link
            href="/team"
            className={getLinkClassName("/team")}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">👥</span>
            <span>Our Team</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t space-y-4">        
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <a href="https://ko-fi.com/U6U31FN5A7" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: '#FFDA6E',
                color: '#202020',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 13px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginTop: '1em',
                cursor: 'pointer'
              }}>
                ❤️ Help us build Hoot.ai
              </button>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
