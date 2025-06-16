"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Edit, RefreshCw, Loader2 } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { getUserProfile, updateUserProfile, UserProfile, ensureUserProfile, checkProfileExists } from "@/lib/user-service"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { PageLayout } from "@/components/page-layout"
import { Skeleton } from "@/components/ui/skeleton"

// Check if we're in development mode
const _isDevelopment = process.env.NODE_ENV === 'development';
// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Check for auth cookies to help debug
const hasAuthCookie = isBrowser && document.cookie.split(';').some(c => 
  c.trim().startsWith('auth_success=') || 
  c.trim().includes('sb-') || 
  c.trim().startsWith('user_id='));

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFixing, setIsFixing] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [saveAttempts, setSaveAttempts] = useState(0)
  const [profileLoaded, setProfileLoaded] = useState(false)

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
      // First check if profile exists
      const exists = await checkProfileExists(user.id);
      
      // Always try to ensure profile exists regardless of check result
      const profile = await ensureUserProfile(user.id)
      
      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Try to load the profile
      const userProfile = await getUserProfile(user.id)
      
      if (userProfile) {
        setProfile(userProfile)
        setDisplayName(userProfile.display_name || '')
        setBio(userProfile.bio || '')
        setErrorMessage(null)
        setProfileLoaded(true)
        if (isBrowser) {
          toast({
            title: "Profile loaded successfully",
            description: "Your profile information has been loaded.",
            variant: "default"
          })
        }
      } else {
        // One more retry attempt with direct database access
        
        // Wait a bit longer
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const finalAttempt = await getUserProfile(user.id)
        
        if (finalAttempt) {
          setProfile(finalAttempt)
          setDisplayName(finalAttempt.display_name || '')
          setBio(finalAttempt.bio || '')
          setErrorMessage(null)
          setProfileLoaded(true)
          if (isBrowser) {
            toast({
              title: "Profile loaded on retry",
              description: "Your profile was loaded after an additional attempt.",
              variant: "default"
            })
          }
        } else {
          setErrorMessage("Still unable to load profile. Please try signing out and back in.")
        }
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
          // For production reliability, always ensure the profile exists first
          const profile = await ensureUserProfile(user.id)
          
          // Wait a moment for database to update
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Then load the profile
          const userProfile = await getUserProfile(user.id)
          
          if (!userProfile) {
            console.error("Profile not found after loading")
            setErrorMessage("Your profile could not be loaded. Click 'Fix Profile' to repair.")
            return
          }
          
          setProfile(userProfile)
          setErrorMessage(null)
          setProfileLoaded(true)
          
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
    
    if (user && !profileLoaded) {
      loadProfile()
    }
  }, [user, profileLoaded])

  // Handle fixing the profile
  const handleFixProfile = async () => {
    if (!user) return
    
    setIsFixing(true)
    setErrorMessage("Fixing profile...")
    
    try {
      // Delete existing profile if any to avoid conflicts (production specific fix)
      let attempts = 0;
      const maxAttempts = 3;
      let newProfile = null;
      
      while (attempts < maxAttempts && !newProfile) {
        attempts++;
        
        // Create a fresh profile
        newProfile = await ensureUserProfile(user.id);
        
        if (!newProfile) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (newProfile) {
        setProfile(newProfile)
        setDisplayName(newProfile.display_name || '')
        setBio(newProfile.bio || '')
        setErrorMessage(null)
        setProfileLoaded(true)
        if (isBrowser) {
          toast({
            title: "Profile fixed",
            description: "Your profile has been repaired successfully.",
            variant: "default"
          })
        }
      } else {
        setErrorMessage("Still unable to fix profile. Please try signing out and back in.")
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
      // Try to save the profile with retries
      let saveAttempts = 0;
      const maxAttempts = 3;
      let saved = false;
      
      while (saveAttempts < maxAttempts && !saved) {
        try {
          // Check if profile exists
          const profileExists = await checkProfileExists(user.id);
          
          if (!profileExists) {
            // Create profile if it doesn't exist
            const createResult = await ensureUserProfile(user.id, {
              display_name: displayName,
              bio: bio
            });
          }
          
          // Update the profile
          const updatedProfile = await updateUserProfile(user.id, {
            display_name: displayName,
            bio: bio
          });
          
          if (updatedProfile) {
            setProfile(updatedProfile)
            setIsEditing(false)
            setErrorMessage(null)
            if (isBrowser) {
              toast({
                title: "Profile saved",
                description: "Your profile has been updated successfully.",
                variant: "default"
              })
            }
            saved = true;
            break;
          } else {
            console.error("Profile update returned null")
            
            // Try a fallback approach - direct profile creation
            const directResult = await ensureUserProfile(user.id, {
              display_name: displayName,
              bio: bio
            });
            
            if (directResult) {
              // Try direct update one more time
              const directUpdateResult = await updateUserProfile(user.id, {
                display_name: displayName,
                bio: bio
              });
              
              if (directUpdateResult) {
                setProfile(directUpdateResult)
                setIsEditing(false)
                setErrorMessage(null)
                if (isBrowser) {
                  toast({
                    title: "Profile saved (fallback)",
                    description: "Your profile has been updated using an alternative method.",
                    variant: "default"
                  })
                }
                saved = true;
                break;
              }
              
              console.error("Profile update succeeded via fallback method:", directUpdateResult)
            } else {
              setErrorMessage("Unable to save profile. Please try refreshing the page and trying again.")
            }
          }
        } catch (error) {
          console.error("Error saving profile:", error)
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        saveAttempts++;
      }
      
      if (!saved) {
        setErrorMessage("Unable to save profile. Please try fixing your profile first.")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrorMessage(`Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

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
          
          <div className="flex justify-center pt-4">
            <Link href="/" className="flex items-center gap-1 text-sm text-gray-600">
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fallback for when user is not authenticated
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-gray-600 mb-6">Please sign in to view and edit your profile.</p>
        <Link href="/auth/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    </div>
  )
} 