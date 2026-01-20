import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  lastPasswordChange?: string;
  photo?: string;
  role: string;
}

interface CachedProfile {
  data: UserProfile;
  timestamp: number;
}

// Storage keys
const PROFILE_CACHE_KEY = '@resqwave:profile_cache';
const PROFILE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Save user profile to cache with timestamp
 */
export const saveProfileToCache = async (profile: UserProfile): Promise<void> => {
  try {
    const cachedProfile: CachedProfile = {
      data: profile,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cachedProfile));
    console.log('Profile saved to cache');
  } catch (error) {
    console.error('Error saving profile to cache:', error);
  }
};

/**
 * Get user profile from cache if valid (not expired)
 * Returns null if cache is empty or expired
 */
export const getProfileFromCache = async (): Promise<UserProfile | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    
    if (!cachedData) {
      console.log('No cached profile found');
      return null;
    }

    const cachedProfile: CachedProfile = JSON.parse(cachedData);
    const now = Date.now();
    const cacheAge = now - cachedProfile.timestamp;

    // Check if cache is still valid
    if (cacheAge < PROFILE_CACHE_DURATION) {
      const remainingTime = Math.round((PROFILE_CACHE_DURATION - cacheAge) / 1000);
      console.log(`Using cached profile (expires in ${remainingTime}s)`);
      return cachedProfile.data;
    } else {
      console.log('Cached profile expired');
      // Clean up expired cache
      await clearProfileCache();
      return null;
    }
  } catch (error) {
    console.error('Error getting profile from cache:', error);
    return null;
  }
};

/**
 * Clear the profile cache
 */
export const clearProfileCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
    console.log('Profile cache cleared');
  } catch (error) {
    console.error('Error clearing profile cache:', error);
  }
};

/**
 * Check if cached profile is still valid (not expired)
 */
export const isCacheValid = async (): Promise<boolean> => {
  try {
    const cachedData = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    
    if (!cachedData) {
      return false;
    }

    const cachedProfile: CachedProfile = JSON.parse(cachedData);
    const now = Date.now();
    const cacheAge = now - cachedProfile.timestamp;

    return cacheAge < PROFILE_CACHE_DURATION;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};

/**
 * Get cache metadata (timestamp, age)
 */
export const getCacheMetadata = async (): Promise<{
  timestamp: number;
  age: number;
  isValid: boolean;
} | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    
    if (!cachedData) {
      return null;
    }

    const cachedProfile: CachedProfile = JSON.parse(cachedData);
    const now = Date.now();
    const age = now - cachedProfile.timestamp;

    return {
      timestamp: cachedProfile.timestamp,
      age,
      isValid: age < PROFILE_CACHE_DURATION,
    };
  } catch (error) {
    console.error('Error getting cache metadata:', error);
    return null;
  }
};
