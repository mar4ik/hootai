"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const { signIn, user } = useAuth()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await signIn(email)
      
      if (response.error) {
        setMessage({ type: "error", text: response.error.message })
      } else {
        setMessage({ 
          type: "success", 
          text: "Check your email for a confirmation link!" 
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
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to get started
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-md border border-green-100 text-center">
              <p className="text-green-800 font-medium">You're signed in as {user.email}</p>
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
          <form onSubmit={handleSignUp} className="space-y-6">
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
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <div className="text-center text-sm">
              <p>
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
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