"use client"

import { useState } from "react"
import Link from "next/link"
import { Rocket, Leaf, Info, Heart, LogOut, UserCircle, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function Sidebar() {
  const { user, loading, signIn, signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authMessage, setAuthMessage] = useState<{type: "success" | "error", text: string} | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return
    
    setIsSubmitting(true)
    setAuthMessage(null)
    
    try {
      const { error } = await signIn(email)
      
      if (error) {
        setAuthMessage({ type: "error", text: error.message })
      } else {
        setAuthMessage({ 
          type: "success", 
          text: "Check your email for a login link!"
        })
        setEmail("")
      }
    } catch {
      setAuthMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-64 border-r bg-background h-full flex flex-col">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🦉</span> Hoot.ai
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 p-3 rounded-md bg-muted/50 text-primary hover:bg-muted transition-colors"
        >
          <Rocket className="h-5 w-5" />
          <span>Getting started</span>
        </Link>
        <Link
          href="/coming-next"
          className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <Leaf className="h-5 w-5" />
          <span>What is coming next?</span>
        </Link>
        <Link href="/about" className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
          <Info className="h-5 w-5" />
          <span>About Hoot.ai</span>
        </Link>
        <Link
          href="/wall-of-fame"
          className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <Heart className="h-5 w-5" />
          <span>Wall of fame</span>
        </Link>
      </nav>
      
      <div className="p-4 border-t space-y-4">
        {!loading && !user && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-1">
              <UserCircle className="h-4 w-4" /> Sign in to save your analyses
            </h3>
            
            <form onSubmit={handleSignIn} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send magic link"}
              </Button>
              
              {authMessage && (
                <p className={`text-xs ${authMessage.type === "error" ? "text-red-500" : "text-green-500"}`}>
                  {authMessage.text}
                </p>
              )}
            </form>
          </div>
        )}
        
        {!loading && user && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Mail className="h-4 w-4" />
                <span className="truncate max-w-[160px]">{user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="h-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <h3 className="font-medium flex items-center gap-1">
            <span className="text-lg">🌱</span> Find this interesting?
          </h3>
          <p className="text-sm text-muted-foreground">
            I&apos;m still looking for people who want to join me in building this awesome product.
          </p>
          <p className="text-sm text-muted-foreground">
            If you&apos;re interested, email me at{" "}
            <a href="mailto:contact@hoot.ai" className="text-primary hover:underline">
              contact@hoot.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
