import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/lib/api-client';

// Types
export interface LoginCredentials {
  emailOrNumber: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  tempToken: string;
  locked?: boolean;
  lockUntil?: string | null;
}

export interface VerifyCodeRequest {
  tempToken: string;
  code: string;
}

export interface VerifyCodeResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name?: string; // Legacy field for compatibility
    firstName?: string;
    lastName?: string;
    email: string;
    address?: string; // Original field (could be JSON)
    addressText?: string; // Parsed text-only address
    role: 'focalPerson' | 'admin' | 'dispatcher';
    newUser?: boolean;
    neighborhood?: {
      id: string;
      terminalID: string;
      terminalName: string;
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Storage keys
const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

class AuthService {
  // Focal Person Login (sends OTP)
  async focalLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login with:', credentials.emailOrNumber);

      // Clear any existing token to ensure clean login
      await AsyncStorage.removeItem(TOKEN_KEY);

      // Trim and normalize identifier to avoid whitespace/formatting issues
      const identifier = String(credentials.emailOrNumber || '').trim();
      // Remove common separators from phone numbers (spaces, dashes)
      const normalizedIdentifier = identifier.replace(/[\s-]/g, '');

      // Use apiFetch for login - it won't add token since none exists yet
      const data = await apiFetch<LoginResponse>('/focal/login', {
        method: 'POST',
        body: JSON.stringify({
          emailOrNumber: normalizedIdentifier,
          password: credentials.password,
        }),
      });

      console.log('✅ Login response:', data);

      // Check if account is locked
      if (data.locked) {
        const lockMessage =
          data.message ||
          'Your account is temporarily locked due to too many failed attempts.';
        throw new Error(lockMessage);
      }

      // Check if the message indicates invalid credentials
      if (data.message && data.message.toLowerCase().includes('invalid')) {
        throw new Error(
          'Invalid email/phone number or password. Please try again.',
        );
      }

      // Store OTP expiry time (5 minutes from now)
      const otpExpiry = Date.now() + 5 * 60 * 1000;
      await AsyncStorage.setItem('focalOtpExpiry', otpExpiry.toString());

      console.log(
        '✅ OTP should be sent. Check your email and backend console.',
      );

      return data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('🔧 Error details:');
      console.error('  - Message:', error.message);
      console.error('  - Type:', error.constructor.name);

      // Network error diagnostics
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        console.error('🌐 Network connectivity issue detected!');
        console.error('  Potential causes:');
        console.error('  1. Backend server is not running');
        console.error('  2. Mobile device cannot reach the backend IP (192.168.1.21:5000)');
        console.error('  3. Firewall is blocking port 5000');
        console.error('  4. Backend is binding to localhost instead of 0.0.0.0');
      }

      throw error;
    }
  }

  // Verify OTP code
  async verifyCode(request: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    try {
      const data = await apiFetch<VerifyCodeResponse>('/focal/verify', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      // Store token and user data
      await this.storeAuthData(data.token, data.user);

      return data;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  // Resend OTP code for focal person login
  async resendFocalLoginCode(tempToken: string): Promise<LoginResponse> {
    try {
      const data = await apiFetch<LoginResponse>('/focal/resend', {
        method: 'POST',
        body: JSON.stringify({ tempToken }),
      });

      // Update OTP expiry time
      const otpExpiry = Date.now() + 5 * 60 * 1000;
      await AsyncStorage.setItem('focalOtpExpiry', otpExpiry.toString());

      return data;
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const data = await apiFetch<{ user: User }>('/me', {
        method: 'GET',
      });

      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        await apiFetch('/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  // Store auth data
  private async storeAuthData(token: string, user: User): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Get token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  // Get stored user
  async getStoredUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Clear auth data
  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  // Mark user as no longer new (complete onboarding)
  async completeOnboarding(): Promise<void> {
    try {
      await apiFetch('/focalperson/complete-onboarding', {
        method: 'POST',
      });

      // Update local user data
      const user = await this.getStoredUser();
      if (user) {
        const updatedUser = { ...user, newUser: false };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Complete onboarding error:', error);
      throw error;
    }
  }

  // Mock login for development
  async mockLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!credentials.emailOrNumber || !credentials.password) {
      throw new Error('Email/phone and password are required');
    }

    if (credentials.password.length < 6) {
      throw new Error('Invalid credentials');
    }

    return {
      message: 'Verification code sent to email',
      tempToken: 'mock_temp_token_' + Date.now(),
    };
  }

  // Mock verify for development
  async mockVerifyCode(
    request: VerifyCodeRequest,
  ): Promise<VerifyCodeResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (request.code.length !== 6) {
      throw new Error('Invalid verification code');
    }

    const mockUser = {
      id: 'FP001',
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@resqwave.ph',
      role: 'focalPerson' as const,
    };

    const mockToken = 'mock_token_' + Date.now();
    await this.storeAuthData(mockToken, mockUser);

    return {
      message: 'Login successful',
      token: mockToken,
      user: mockUser,
    };
  }
}

export const authService = new AuthService();
