"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Edit, RefreshCw, Loader2 } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/user-service"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export default function ProfilePage() {
  const { user, loading, forceCreateProfile } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFixing, setIsFixing] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Set up a timeout for loading state
  useEffect(() => {
    // If still loading after 5 seconds, show timeout message
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true)
      }
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [loading])

  // Handle manual profile load if timeout occurs
  const handleManualLoad = async () => {
    if (!user) {
      router.push("/auth/sign-in")
      return
    }

    setIsFixing(true)
    setErrorMessage("Manually loading profile...")
    
    try {
      // Force create the profile first
      await forceCreateProfile()
      
      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Try to load the profile
      const userProfile = await getUserProfile(user.id)
      
      if (userProfile) {
        setProfile(userProfile)
        setDisplayName(userProfile.display_name || '')
        setBio(userProfile.bio || '')
        setErrorMessage(null)
      } else {
        setErrorMessage("Still unable to load profile. Please try again.")
      }
    } catch (err) {
      console.error("Error manually loading profile:", err)
      setErrorMessage("Error loading profile. Please try refreshing the page.")
    } finally {
      setIsFixing(false)
    }
  }

  // Fetch user profile data
  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          console.log("Loading profile for user:", user.id)
          const userProfile = await getUserProfile(user.id)
          
          if (!userProfile) {
            console.error("Profile not found after loading")
            setErrorMessage("Your profile could not be loaded. Click 'Fix Profile' to repair.")
            return
          }
          
          setProfile(userProfile)
          setErrorMessage(null)
          
          if (userProfile) {
            setDisplayName(userProfile.display_name || '')
            setBio(userProfile.bio || '')
          }
        } catch (err) {
          console.error("Error loading profile:", err)
          setErrorMessage("Error loading your profile. Click 'Fix Profile' to repair.")
        }
      }
    }
    
    if (user) {
      loadProfile()
    }
  }, [user])

  // Handle fixing the profile
  const handleFixProfile = async () => {
    if (!user) return
    
    setIsFixing(true)
    setErrorMessage("Fixing profile...")
    
    try {
      await forceCreateProfile()
      
      // Wait a moment to let the database update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Try to load the profile again
      const userProfile = await getUserProfile(user.id)
      
      if (userProfile) {
        setProfile(userProfile)
        setDisplayName(userProfile.display_name || '')
        setBio(userProfile.bio || '')
        setErrorMessage(null)
      } else {
        setErrorMessage("Still unable to load profile. Please contact support.")
      }
    } catch (_) {
      setErrorMessage("Error fixing profile. Please try again or contact support.")
    } finally {
      setIsFixing(false)
    }
  }

  // Handle sign out and redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in")
    }
  }, [user, loading, router])

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsSaving(true)
    
    try {
      const updatedProfile = await updateUserProfile(user.id, {
        display_name: displayName,
        bio: bio
      })
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        setIsEditing(false)
      } else {
        setErrorMessage("Unable to save profile. Try fixing your profile first.")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrorMessage("Error saving profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('default', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return 'Invalid date';
    }
  };

  // Show loading state with timeout option
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-white rounded-xl shadow-md p-6">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600 mb-4">Please wait while we load your profile.</p>
          
          {loadingTimeout && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <p className="font-medium mb-1">Taking longer than expected</p>
                <p className="text-sm">This is taking longer than usual. You can try manually loading your profile.</p>
              </div>
              
              <Button 
                onClick={handleManualLoad} 
                disabled={isFixing} 
                className="w-full"
              >
                {isFixing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Manually Load Profile"
                )}
              </Button>
              
              <div className="text-sm text-gray-500">
                <p>You can also try:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Refreshing the page</li>
                  <li>Signing out and back in</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show content if authenticated
  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
              <p>{errorMessage}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFixProfile} 
                disabled={isFixing}
                className="flex items-center gap-1 whitespace-nowrap ml-2"
              >
                <RefreshCw size={14} className={isFixing ? "animate-spin" : ""} />
                {isFixing ? "Fixing..." : "Fix Profile"}
              </Button>
            </div>
          )}
          
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            
            <div className="mb-8">
              <UserAvatar size="lg" className="mb-4 ml-auto mr-auto" />
              
              {isEditing ? (
                <div className="space-y-4 w-full max-w-sm">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="flex items-center gap-1"
                    >
                      <Save size={16} />
                      {isSaving ? "Saving..." : "Save Profile"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 ml-auto mr-auto">
                  <h2 className="text-xl font-medium">
                    {profile?.display_name || user.email?.split('@')[0] || 'User'}
                  </h2>
                  <p className="text-gray-600 my-2">
                    {profile?.bio || 'No bio yet'}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {user.email}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 ml-auto mr-auto"
                    disabled={!profile}
                  >
                    <Edit size={14} />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Account Information - only visible in development */}
          {isDevelopment && (
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h2 className="text-lg font-medium mb-2">Account Information</h2>
              <p className="text-sm mb-2">User ID: <span className="font-mono bg-white px-2 py-1 rounded">{user.id}</span></p>
              <p className="text-sm mb-2">Email: <span className="font-mono bg-white px-2 py-1 rounded">{user.email}</span></p>
              <p className="text-sm">Last Sign In: <span className="font-mono bg-white px-2 py-1 rounded">
                {formatDate(profile?.last_sign_in)}
              </span></p>
            </div>
          )}
          
          <div className="flex justify-between">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowLeft size={14} /> Back to Main
              </Button>
            </Link>
            
            {/* Protected Page button - only visible in development */}
            {isDevelopment && (
              <Link href="/protected">
                <Button variant="outline" size="sm">
                  Protected Page
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // This should never render, but just in case
  return null
} 