import { apiFetch } from '@/lib/api-client';

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

// Fetch current user profile
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const data = await apiFetch<{ user: UserProfile }>('/me');
    return data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (updates: UpdateProfileRequest): Promise<UserProfile> => {
  try {
    const data = await apiFetch<{ user: UserProfile }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update password
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await apiFetch('/user/password', {
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

// Upload profile picture
export const uploadProfilePicture = async (imageUri: string): Promise<UserProfile> => {
  try {
    // Validate URI
    if (!imageUri) {
      throw new Error('Image URI is required');
    }

    // Get file info
    const fileInfo = await getImageFileInfo(imageUri);
    
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: fileInfo.type || 'image/jpeg',
      name: fileInfo.name || 'profile.jpg',
    } as any);

    const data = await apiFetch<{ user: UserProfile }>('/profile/photo', {
      method: 'POST',
      body: formData,
    });

    return data.user;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    throw new Error(`Failed to upload profile picture: ${errorMessage}`);
  }
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

// Update profile picture (alias for uploadProfilePicture)
export const updateProfilePicture = async (imageUri: string): Promise<UserProfile> => {
  return uploadProfilePicture(imageUri);
};
