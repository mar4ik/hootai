import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a function to get Supabase client with proper config
const getSupabaseClient = () => {
  // Try to use window environment variables if available (for production fallback)
  const url = typeof window !== 'undefined' && (window as {ENV_SUPABASE_URL?: string}).ENV_SUPABASE_URL 
    ? (window as {ENV_SUPABASE_URL?: string}).ENV_SUPABASE_URL 
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
  
  return createClient(effectiveUrl, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
};

export type UserProfile = {
  id: string
  created_at: string
  updated_at: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  preferences?: Record<string, unknown>
  last_sign_in?: string
}

/**
 * Direct database operation to check if user profile exists
 */
export async function checkProfileExists(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return false;
  }
  
  try {
    const { error, count } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })
      .eq('id', userId);
    
    if (error) {
      console.error('Error checking if profile exists:', error);
      return false;
    }
    
    return (count || 0) > 0;
  } catch (err) {
    console.error('Unexpected error checking profile existence:', err);
    return false;
  }
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
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (err) {
    console.error('Unexpected error fetching user profile:', err);
    return null;
  }
}

/**
 * Ensure user profile exists, create it if it doesn't
 */
export async function ensureUserProfile(userId: string): Promise<UserProfile | null> {
  // First check if the profile already exists
  const exists = await checkProfileExists(userId);
  
  if (exists) {
    return getUserProfile(userId);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return null;
  }
  
  try {
    // Create a new profile if it doesn't exist
    // Use RPC to bypass RLS policies for initial creation
    const { data, error } = await supabase
      .rpc('create_user_profile', { 
        user_id: userId,
        current_timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating user profile:', error);
      
      // Fallback: Try direct insert as the authenticated user
      // This will work if the user is creating their own profile
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      
      if (userId === currentUserId) {
        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: userId,
              display_name: null,
              bio: null,
              avatar_url: null,
              updated_at: new Date().toISOString()
            },
          ])
          .select();
        
        if (insertError) {
          console.error('Error in fallback profile creation:', insertError);
          return null;
        }
        
        return insertData[0] as UserProfile;
      }
      
      return null;
    }
    
    // Get the newly created profile
    return getUserProfile(userId);
  } catch (err) {
    console.error('Unexpected error creating user profile:', err);
    return null;
  }
}

/**
 * Direct database operation to update user profile
 */
async function directUpdateProfile(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  profile: Partial<UserProfile>
): Promise<UserProfile | null> {
  if (!supabase) return null;
  
  try {
    const updateObj = {
      ...profile,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateObj)
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('Error in direct profile update:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from update operation');
      return null;
    }
    
    return data[0] as UserProfile;
  } catch (err) {
    console.error('Unexpected error in direct profile update:', err);
    return null;
  }
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
  
  // First ensure the profile exists
  const profileExists = await checkProfileExists(userId);
  
  if (!profileExists) {
    const newProfile = await ensureUserProfile(userId);
    if (!newProfile) {
      console.error('Failed to create profile before update');
      return null;
    }
  }
  
  // Now update the profile with retry logic
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const result = await directUpdateProfile(supabase, userId, profile);
      
      if (result) {
        return result;
      }
      
      if (attempts < maxAttempts) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error during update attempt ${attempts}:`, error);
      
      if (attempts < maxAttempts) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error(`Failed to update profile after ${maxAttempts} attempts`);
  return null;
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
  const currentPreferences = profile?.preferences || {}
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