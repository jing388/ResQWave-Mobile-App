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
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const data = await apiFetch<{ user: UserProfile }>('/user/photo', {
      method: 'POST',
      body: formData,
      headers: {}, // Let fetch set Content-Type to multipart/form-data
    });

    return data.user;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};
