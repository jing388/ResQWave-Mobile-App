import { apiFetch, API_BASE_URL } from '@/lib/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { 
  saveProfileToCache, 
  getProfileFromCache
} from './profile-cache';

const TOKEN_KEY = '@auth_token';
const PROFILE_IMAGE_PATH_KEY_PREFIX = '@resqwave:profile_image_path:';

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

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface BackendUserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  contactNumber?: string;
  address?: string;
  lastPasswordChange?: string;
  passwordLastUpdated?: string;
  photo?: unknown;
  role: string;
}

const normalizeProfile = (user: BackendUserProfile): UserProfile => {
  const firstName = user.firstName || user.name?.split(' ')[0] || '';
  const lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';
  const rawPhoto = user.photo;

  let normalizedPhoto: string | undefined;
  if (typeof rawPhoto === 'string' && rawPhoto.trim().length > 0) {
    normalizedPhoto = rawPhoto.startsWith('http') ? rawPhoto : `${API_BASE_URL}${rawPhoto}`;
  } else if (rawPhoto) {
    // Some endpoints return photo as a blob/buffer-like object; use the protected image route.
    normalizedPhoto = `${API_BASE_URL}/focalperson/${user.id}/photo`;
  }

  return {
    id: user.id,
    firstName,
    lastName,
    email: user.email,
    phone: user.phone || user.contactNumber,
    address: user.address,
    lastPasswordChange: user.lastPasswordChange || user.passwordLastUpdated,
    photo: normalizedPhoto,
    role: user.role,
  };
};

// Fetch current user profile with caching support
export const getProfile = async (options?: { forceRefresh?: boolean }): Promise<UserProfile> => {
  try {
    // Check cache first unless force refresh is requested
    if (!options?.forceRefresh) {
      const cachedProfile = await getProfileFromCache();
      if (cachedProfile) {
        return cachedProfile;
      }
    }

    // Fetch from API
    console.log('Fetching fresh profile data from API...');
    const data = await apiFetch<{ user: BackendUserProfile }>('/me');
    const normalizedProfile = normalizeProfile(data.user);
    
    // Save to cache
    await saveProfileToCache(normalizedProfile);
    
    return normalizedProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (updates: UpdateProfileRequest): Promise<UserProfile> => {
  try {
    // Resolve current focal person ID and update via focalperson route used by backend.
    const currentUserData = await apiFetch<{ user: BackendUserProfile }>('/me');
    const userId = currentUserData.user.id;

    await apiFetch(`/focalperson/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    // Re-fetch normalized profile to keep UI in sync with persisted backend state.
    const normalizedProfile = await getProfile({ forceRefresh: true });
    
    // Update cache with new data
    await saveProfileToCache(normalizedProfile);
    
    return normalizedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update password
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await apiFetch('/focalperson/me/changePassword', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Upload profile picture - read file and send to backend
export const uploadProfilePicture = async (imageUri: string): Promise<UserProfile> => {
  try {
    console.log('📸 [uploadProfilePicture] Starting upload from URI:', imageUri);

    // Validate URI
    if (!imageUri) {
      throw new Error('Image URI is required');
    }

    // Get current user first to get ID
    const currentUserData = await apiFetch<{ user: BackendUserProfile }>('/me');
    const userId = currentUserData.user.id;
    console.log('👤 [uploadProfilePicture] Current user ID:', userId);

    // Get file info
    const fileInfo = await getImageFileInfo(imageUri);
    console.log('📄 [uploadProfilePicture] File info:', fileInfo);

    // Read file as base64 from device
    console.log('📖 [uploadProfilePicture] Reading file from device...');
    let fileBase64: string;
    
    try {
      fileBase64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('✅ [uploadProfilePicture] File read successfully, size:', fileBase64.length);
    } catch (readError) {
      console.error('❌ [uploadProfilePicture] Failed to read file:', readError);
      throw new Error(`Failed to read image file: ${readError}`);
    }

    // Create FormData with file
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: fileInfo.type || 'image/jpeg',
      name: fileInfo.name || 'profile.jpg',
    } as any);

    console.log('📤 [uploadProfilePicture] Uploading to /focalperson/:id/photos endpoint...');

    // Get token for headers
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('🔑 [uploadProfilePicture] Token available:', !!token);

    // Upload directly with fetch to handle FormData correctly on React Native
    const uploadUrl = `${API_BASE_URL}/focalperson/${userId}/photos`;
    console.log('🌐 [uploadProfilePicture] Upload URL:', uploadUrl);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    console.log('📡 [uploadProfilePicture] Upload response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [uploadProfilePicture] Upload failed:', errorText);
      throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
    }

    console.log('✅ [uploadProfilePicture] Upload successful!');

    // Remove stale local cached image so next read always reflects the latest upload.
    try {
      await clearLocalProfileImageCache(userId);
      console.log('🗑️ [uploadProfilePicture] Cleared stale local profile image cache');
    } catch (cacheError) {
      console.warn('⚠️ [uploadProfilePicture] Could not clear local profile cache:', cacheError);
    }

    // Clear profile cache and fetch fresh data
    console.log('🔄 [uploadProfilePicture] Refreshing profile data...');
    const updatedProfile = await getProfile({ forceRefresh: true });
    console.log('✅ [uploadProfilePicture] Profile refreshed, photo:', updatedProfile.photo);

    return updatedProfile;
  } catch (error) {
    console.error('❌ [uploadProfilePicture] Error uploading profile picture:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    throw new Error(`Failed to upload profile picture: ${errorMessage}`);
  }
};

// Backward-compatible alias used by profile screen imports.
export const updateProfilePicture = uploadProfilePicture;

// Get local storage paths for profile images
const getLocalProfileImagePath = (userId: string, version?: number): string => {
  const suffix = version ? `_${version}` : '';
  return `${FileSystem.documentDirectory}profile_${userId}${suffix}.jpg`;
};

const getProfileImageStorageKey = (userId: string): string => {
  return `${PROFILE_IMAGE_PATH_KEY_PREFIX}${userId}`;
};

const getStoredLocalProfileImagePath = async (userId: string): Promise<string | null> => {
  return AsyncStorage.getItem(getProfileImageStorageKey(userId));
};

const setStoredLocalProfileImagePath = async (userId: string, path: string): Promise<void> => {
  await AsyncStorage.setItem(getProfileImageStorageKey(userId), path);
};

const clearLocalProfileImageCache = async (userId: string): Promise<void> => {
  const storedPath = await getStoredLocalProfileImagePath(userId);
  if (storedPath) {
    await FileSystem.deleteAsync(storedPath, { idempotent: true });
  }
  await AsyncStorage.removeItem(getProfileImageStorageKey(userId));
};

// Download and save profile image locally using fetch
const downloadAndSaveProfileImage = async (userId: string, imageUrl: string, token: string | null): Promise<string | undefined> => {
  try {
    console.log('📥 [downloadAndSaveProfileImage] Downloading image from:', imageUrl);
    
    const version = Date.now();
    const localPath = getLocalProfileImagePath(userId, version);
    
    // Save to local cache via legacy API to avoid RN Blob/FileReader/btoa issues.
    await FileSystem.downloadAsync(imageUrl, localPath, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    await setStoredLocalProfileImagePath(userId, localPath);

    console.log('✅ [downloadAndSaveProfileImage] Image saved locally:', localPath);
    return localPath;
  } catch (error) {
    console.error('⚠️ [downloadAndSaveProfileImage] Failed to download and save image:', error);
    // Return undefined if download fails, but don't throw - we can still use the URL
    return undefined;
  }
};

// Get cached profile image or fetch from server
const getProfileImageUri = async (userId: string, serverImageUrl: string | undefined, token: string | null): Promise<string | undefined> => {
  if (!serverImageUrl) {
    return undefined;
  }

  // Check if the latest tracked local copy exists
  const localPath = await getStoredLocalProfileImagePath(userId);
  
  if (localPath) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        console.log('🖼️ [getProfileImageUri] Using cached local image:', localPath);
        return localPath;
      }
    } catch (error) {
      console.log('ℹ️ [getProfileImageUri] Tracked local image not found, will fetch from server');
    }
  }

  // If no local copy, download it
  if (serverImageUrl.includes('/focalperson/')) {
    const localImagePath = await downloadAndSaveProfileImage(userId, serverImageUrl, token);
    if (localImagePath) {
      return localImagePath;
    }
  }

  // Fall back to server URL if local download fails
  console.log('🌐 [getProfileImageUri] Using server image URL');
  return serverImageUrl;
};

// Helper function to get file info from URI
const getImageFileInfo = async (uri: string): Promise<{ type: string; name: string }> => {
  try {
    // Extract file extension from URI
    const uriParts = uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1];
    
    // Determine MIME type based on extension
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    
    const mimeType = mimeTypes[fileExtension.toLowerCase()] || 'image/jpeg';
    const fileName = `profile.${fileExtension || 'jpg'}`;
    
    return { type: mimeType, name: fileName };
  } catch (error) {
    console.error('Error getting file info:', error);
    return { type: 'image/jpeg', name: 'profile.jpg' };
  }
};

// Function to prepare profile with local image caching
export const prepareProfileWithLocalImage = async (profile: UserProfile, token: string | null): Promise<UserProfile> => {
  if (!profile.photo) {
    return profile;
  }

  try {
    const localImageUri = await getProfileImageUri(profile.id, profile.photo, token);
    if (localImageUri && localImageUri !== profile.photo) {
      console.log('🖼️ Using local image instead of server URL');
      return {
        ...profile,
        photo: localImageUri,
      };
    }
  } catch (error) {
    console.warn('⚠️ Could not prepare local image:', error);
  }

  return profile;
};
