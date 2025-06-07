import { supabase } from './supabase'
import type { Database } from './supabase'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

/**
 * Fetch a user's profile by their user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string,
  profile: Partial<Database['public']['Tables']['user_profiles']['Update']>
): Promise<UserProfile | null> {
  // Add updated_at timestamp
  const updatedProfile = {
    ...profile,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updatedProfile)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

/**
 * Update the last sign-in time for a user
 */
export async function updateLastSignInTime(userId: string): Promise<boolean> {
  try {
    // Try to update the last_sign_in time directly
    // This will work if the column exists, and fail gracefully if it doesn't
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        last_sign_in: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      // If we get a specific error about the column not existing
      if (updateError.message && updateError.message.includes('column "last_sign_in" of relation "user_profiles" does not exist')) {
        console.warn('The last_sign_in column does not exist. Please run the migration script.')
      } else {
        console.error('Error updating last sign-in time:', updateError)
      }
      return false
    }

    return true
  } catch (err) {
    console.error('Unexpected error updating last sign-in time:', err)
    return false
  }
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(
  userId: string,
  avatarFile: File
): Promise<string | null> {
  // Upload avatar to storage
  const fileName = `${userId}-${Date.now()}`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, avatarFile, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return null
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const avatarUrl = publicUrlData.publicUrl

  // Update user profile with avatar URL
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user profile with avatar:', updateError)
    return null
  }

  return avatarUrl
}

/**
 * Set user preference
 */
export async function setUserPreference(
  userId: string,
  key: string,
  value: any
): Promise<boolean> {
  // First get current preferences
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('id', userId)
    .single()

  if (fetchError) {
    console.error('Error fetching user preferences:', fetchError)
    return false
  }

  // Update preferences
  const currentPreferences = profile.preferences || {}
  const updatedPreferences = {
    ...currentPreferences,
    [key]: value,
  }

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      preferences: updatedPreferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user preferences:', updateError)
    return false
  }

  return true
}

/**
 * Ensure a user profile exists for the given user ID
 * This is a more robust function that tries multiple approaches to ensure a profile exists
 */
export async function ensureUserProfile(userId: string): Promise<UserProfile | null> {
  console.log("Ensuring user profile exists for:", userId)
  
  try {
    // First check if profile already exists
    const existingProfile = await getUserProfile(userId)
    
    if (existingProfile) {
      console.log("User profile already exists")
      
      // Update last sign-in time
      await updateLastSignInTime(userId)
      return existingProfile
    }
    
    console.log("No profile found, creating new one")
    
    // Try direct insert first
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{ 
          id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString()
        }])
        .select()
      
      if (error) {
        console.error("Error creating profile via insert:", error)
        throw error
      }
      
      console.log("Created user profile via insert")
      return data[0]
    } catch (insertError) {
      console.error("Insert approach failed:", insertError)
      
      // Try RPC approach as fallback
      try {
        const { data, error } = await supabase.rpc('create_user_profile', { user_id: userId })
        
        if (error) {
          console.error("Error creating profile via RPC:", error)
          throw error
        }
        
        console.log("Created user profile via RPC")
        
        // Fetch the newly created profile
        return await getUserProfile(userId)
      } catch (rpcError) {
        console.error("RPC approach failed:", rpcError)
        
        // Try raw SQL as a last resort
        try {
          const { error } = await supabase.rpc('execute_sql', {
            sql_query: `
              INSERT INTO public.user_profiles (id, created_at, updated_at, last_sign_in)
              VALUES ('${userId}', now(), now(), now())
              ON CONFLICT (id) DO UPDATE
              SET updated_at = now(), last_sign_in = now()
            `
          })
          
          if (error) {
            console.error("Error creating profile via SQL:", error)
            throw error
          }
          
          console.log("Created or updated user profile via SQL")
          return await getUserProfile(userId)
        } catch (sqlError) {
          console.error("All approaches failed:", sqlError)
          return null
        }
      }
    }
  } catch (err) {
    console.error("Error ensuring user profile:", err)
    return null
  }
} 