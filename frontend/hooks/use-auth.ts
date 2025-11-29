import { authService } from '@/services/auth-service';
import { useState } from 'react';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (emailOrNumber: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use mock login for development
      // Switch to authService.focalLogin when backend is ready
      const USE_MOCK = false; // Change to false when backend is ready

      const response = USE_MOCK
        ? await authService.mockLogin({ emailOrNumber, password })
        : await authService.focalLogin({ emailOrNumber, password });

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (tempToken: string, code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use mock verify for development
      const USE_MOCK = false; // Change to false when backend is ready

      const response = USE_MOCK
        ? await authService.mockVerifyCode({ tempToken, code })
        : await authService.verifyCode({ tempToken, code });

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async (tempToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.resendFocalLoginCode(tempToken);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resend code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    verifyCode,
    resendCode,
    logout,
    isLoading,
    error,
    clearError,
  };
};
