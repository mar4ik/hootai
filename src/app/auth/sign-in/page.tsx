"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const { signIn, user } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await signIn(email)
      
      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ 
          type: "success", 
          text: "Check your email for a login link!" 
        })
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "An unexpected error occurred. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a magic link
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-md border border-green-100 text-center">
              <p className="text-green-800 font-medium">You&apos;re signed in as {user.email}</p>
            </div>
            
            <div className="flex justify-center">
              <Link href="/protected">
                <Button className="flex items-center gap-2">
                  <Lock size={16} /> View Protected Content
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800" 
                  : "bg-red-50 text-red-800"
              }`}>
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending link..." : "Send magic link"}
            </Button>

            <div className="text-center text-sm">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        )}

        <div className="flex justify-center items-center pt-4">
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-600"> 
            <ArrowLeft size={14} /> Back to Main Page
          </Link>
        </div>
      </div>
    </div>
  )
} 