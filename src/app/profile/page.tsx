"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Edit, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/user-service"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Check if we're in development mode
const _isDevelopment = process.env.NODE_ENV === 'development';

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
  const [showAccountDetails, setShowAccountDetails] = useState(false)
  const [saveAttempts, setSaveAttempts] = useState(0)

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
    } catch (err) {
      console.error("Error fixing profile:", err)
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
    setSaveAttempts(prev => prev + 1)
    
    try {
      console.log(`Profile save attempt ${saveAttempts + 1} for user:`, user.id, {
        display_name: displayName,
        bio: bio
      })
      
      const updatedProfile = await updateUserProfile(user.id, {
        display_name: displayName,
        bio: bio
      })
      
      if (updatedProfile) {
        console.log("Profile updated successfully:", updatedProfile)
        setProfile(updatedProfile)
        setIsEditing(false)
        setErrorMessage(null)
      } else {
        console.error("Profile update returned null")
        
        // Try to create profile if update failed and we haven't tried creating one
        if (saveAttempts === 0) {
          console.log("Attempting to create profile first and then update")
          await forceCreateProfile()
          
          // Wait a moment for the creation to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Try updating again
          const retryProfile = await updateUserProfile(user.id, {
            display_name: displayName,
            bio: bio
          })
          
          if (retryProfile) {
            console.log("Profile update succeeded after creation:", retryProfile)
            setProfile(retryProfile)
            setIsEditing(false)
            setErrorMessage(null)
          } else {
            setErrorMessage("Unable to save profile. Please try fixing your profile first.")
          }
        } else {
          setErrorMessage("Unable to save profile. Try fixing your profile first.")
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrorMessage(`Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
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
          
          <div className="flex flex-col items-center justify-center text-center">
            <UserAvatar size="lg" className="mb-4" />
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
          
          <div className="space-y-4">
            {isEditing ? (
              // Edit Mode
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A short bio about yourself"
                    maxLength={250}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">{bio.length}/250 characters</p>
                </div>
                
                <div className="flex justify-center gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center gap-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-1">Display Name</h2>
                  <p className="p-2 bg-gray-50 rounded border border-gray-100">
                    {profile?.display_name || "Not set"}
                  </p>
                </div>
                
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-1">Bio</h2>
                  <p className="p-2 bg-gray-50 rounded border border-gray-100 min-h-[80px] whitespace-pre-wrap">
                    {profile?.bio || "No bio added yet"}
                  </p>
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1"
                    // Enable the button even if profile is null - it will create one when saving
                    disabled={false}
                  >
                    <Edit size={16} />
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Collapsible Account Details Section */}
          <div className="pt-4 border-t">
            <button
              onClick={() => setShowAccountDetails(!showAccountDetails)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <span>Account Details</span>
              {showAccountDetails ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>
            
            {showAccountDetails && (
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-gray-500">User ID</p>
                  <p className="font-mono text-xs bg-gray-50 p-1 rounded mt-1 overflow-hidden overflow-ellipsis">
                    {user?.id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="bg-gray-50 p-1 rounded mt-1">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Profile Created</p>
                  <p className="bg-gray-50 p-1 rounded mt-1">
                    {formatDate(profile?.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="bg-gray-50 p-1 rounded mt-1">
                    {formatDate(profile?.updated_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center pt-4">
            <Link href="/" className="flex items-center gap-1 text-sm text-gray-600">
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // This should never render, but just in case
  return null
} 