"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showOwl, setShowOwl] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in")
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your profile.</p>
        </div>
      </div>
    )
  }

  // Show content if authenticated
  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            
            <div className="mb-8">
              <UserAvatar size="lg" showOwl={showOwl} className="mb-4" />
              <p className="text-gray-600 mb-4">
                {user.email}
              </p>
              
              <div className="flex gap-2 justify-center">
                <Button 
                  variant={showOwl ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowOwl(true)}
                >
                  Show Owl
                </Button>
                <Button 
                  variant={!showOwl ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowOwl(false)}
                >
                  Show Initials
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h2 className="text-lg font-medium mb-2">Account Information</h2>
            <p className="text-sm mb-2">User ID: <span className="font-mono bg-white px-2 py-1 rounded">{user.id}</span></p>
            <p className="text-sm">Email: <span className="font-mono bg-white px-2 py-1 rounded">{user.email}</span></p>
          </div>
          
          <div className="flex justify-between">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowLeft size={14} /> Back to Main
              </Button>
            </Link>
            
            <Link href="/protected">
              <Button variant="outline" size="sm">
                Protected Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // This should never render, but just in case
  return null
} 