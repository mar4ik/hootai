"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

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
          <p className="text-gray-600">Please wait while we check your authentication status.</p>
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
            <UserAvatar size="lg" showOwl={false} className="mb-4" />
            <h1 className="text-3xl font-bold">Protected Content</h1>
            <p className="mt-2 text-gray-600">
              Welcome, {user.email}! This page is only visible to authenticated users.
            </p>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h2 className="text-lg font-medium mb-2">Your Authentication Details</h2>
            <p className="text-sm mb-2">User ID: <span className="font-mono bg-white px-2 py-1 rounded">{user.id}</span></p>
            <p className="text-sm">Email: <span className="font-mono bg-white px-2 py-1 rounded">{user.email}</span></p>
          </div>
          
          <div className="text-center">
            <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 justify-center">
              <ArrowLeft size={14} /> Back to Main Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // This should never render, but just in case
  return null
} 