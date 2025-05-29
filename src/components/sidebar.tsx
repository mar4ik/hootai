"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
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

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="sidebar-toggle md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-background shadow-md border"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}
      
      {/* Sidebar content */}
      <div 
        className={`sidebar-content fixed md:static inset-y-0 left-0 z-40 w-64 border-r bg-background flex flex-col transition-transform duration-300 md:transform-none ${
          isOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => isMobile && setIsOpen(false)}>
            <span className="text-2xl">🦉</span> Hoot.ai
          </Link>
          {/* <button 
            className="md:hidden p-1"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button> */}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/"
            className="flex items-center gap-2 p-3 rounded-md bg-muted/50 text-primary hover:bg-muted transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">🚀</span>
            <span>Getting started</span>
          </Link>
          <Link
            href="/what_is_next"
            className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">🍀</span>
            <span>What is coming next?</span>
          </Link>
          <Link 
            href="/about" 
            className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">🤔</span>
            <span>About Hoot.ai</span>
          </Link>
          <Link
            href="/wall_of_fame"
            className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">❤️</span>
            <span>Wall of fame</span>
          </Link>
          <Link
            href="/team"
            className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className="text-xl">👥</span>
            <span>Our Team</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t space-y-4">        
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            {/* <h3 className="font-small flex items-center gap-1">
              <span className="text-lg">🍀</span> Find this interesting?
            </h3>
            <p className="text-sm text-muted-foreground">
              We are still looking for people who want to join us in building this awesome product.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              If you&apos;re interested, email me at{" "}
              <a href="mailto:mariam.morozova@gmail.com" className="text-indigo-500 hover:text-indigo-600 hover:underline">
                mariam.morozova@gmail.com
              </a> or <a href="mailto:eunzie@gmail.com" className="text-indigo-500 hover:text-indigo-600 hover:underline">
                eunzie@gmail.com
              </a>
            </p> */}
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
