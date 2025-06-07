import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a function to get Supabase client with proper config
const getSupabaseClient = () => {
  // Try to use window environment variables if available (for production fallback)
  const url = typeof window !== 'undefined' && window.ENV_SUPABASE_URL 
    ? window.ENV_SUPABASE_URL 
    : supabaseUrl;
  
  // Fallback URL for production
  const fallbackUrl = 'https://eaennrqqtlmanbivdhqm.supabase.co';
  
  // Use fallback if needed
  const effectiveUrl = url || fallbackUrl;
  
  const key = supabaseAnonKey;
  
  if (!effectiveUrl || !key) {
    console.error("Cannot create Supabase client: missing credentials");
    return null;
  }
  
  return createClient(effectiveUrl, key);
};

export type UserProfile = {
  id: string
  created_at: string
  updated_at: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

/**
 * Get user profile from the database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return null;
  }
  
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
 * Ensure user profile exists, create it if it doesn't
 */
export async function ensureUserProfile(userId: string): Promise<UserProfile | null> {
  // First check if the profile already exists
  const existingProfile = await getUserProfile(userId)
  
  if (existingProfile) {
    console.log('User profile already exists:', userId)
    return existingProfile
  }
  
  console.log('Creating new user profile for:', userId)
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return null;
  }
  
  // Create a new profile if it doesn't exist
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([
      {
        id: userId,
        display_name: null,
        bio: null,
        avatar_url: null,
      },
    ])
    .select()
  
  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }
  
  return data[0]
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return null;
  }
  
  console.log('Updating profile for user:', userId, profile);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
  
  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }
  
  console.log('Profile update successful:', data);
  return data[0]
}

/**
 * Update last sign in time
 */
export async function updateLastSignInTime(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return false;
  }
  
  const { error } = await supabase
    .from('user_profiles')
    .update({
      last_sign_in: new Date().toISOString(),
    })
    .eq('id', userId)
  
  if (error) {
    console.error('Error updating last sign in time:', error)
    return false
  }
  
  return true
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(
  userId: string,
  avatarFile: File
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return null;
  }
  
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
  value: unknown
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return false;
  }
  
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