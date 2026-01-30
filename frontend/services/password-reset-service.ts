import { apiFetch } from '@/lib/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for Password Reset Flow
export interface RequestResetResponse {
  success: boolean;
  message: string;
  userID: number;
  expiresInMinutes: number;
  maskedEmail: string;
}

export interface VerifyResetCodeResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Storage keys for password reset flow
const RESET_USER_ID_KEY = '@password_reset_user_id';
const RESET_CODE_KEY = '@password_reset_code';
const RESET_EMAIL_KEY = '@password_reset_email';
const RESET_RECOVERED_KEY = '@password_reset_recovered';

class PasswordResetService {
  /**
   * Step 1: Request password reset - sends verification code to email
   */
  async requestPasswordReset(
    emailOrNumber: string,
  ): Promise<RequestResetResponse> {
    try {
      console.log('📧 Requesting password reset for:', emailOrNumber);

      // Clear any previous reset session
      await this.clearResetSession();

      // Trim and normalize identifier
      const identifier = String(emailOrNumber || '').trim();
      const normalizedIdentifier = identifier.replace(/[\s-]/g, '');

      const data = await apiFetch<RequestResetResponse>('/focal/reset', {
        method: 'POST',
        body: JSON.stringify({ emailOrNumber: normalizedIdentifier }),
      });

      console.log('✅ Password reset requested:', data);

      // Store userID and masked email for next steps
      await AsyncStorage.setItem(RESET_USER_ID_KEY, data.userID.toString());
      await AsyncStorage.setItem(RESET_EMAIL_KEY, data.maskedEmail);

      // Detect if backend indicates the account was already recovered
      const alreadyRecovered = /already\s+recover|already\s+recovered|account\s+recovered/i.test(
        String(data.message || ''),
      );
      await AsyncStorage.setItem(RESET_RECOVERED_KEY, alreadyRecovered ? 'true' : 'false');

      // Store expiry time
      const expiryTime = Date.now() + data.expiresInMinutes * 60 * 1000;
      await AsyncStorage.setItem(
        '@password_reset_expiry',
        expiryTime.toString(),
      );

      return data;
    } catch (error: any) {
      console.error('❌ Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Step 2: Verify reset code
   */
  async verifyResetCode(code: string): Promise<VerifyResetCodeResponse> {
    try {
      const userID = await AsyncStorage.getItem(RESET_USER_ID_KEY);

      if (!userID) {
        throw new Error('No active reset session. Please start over.');
      }

      console.log('🔑 Verifying reset code for user:', userID);

      const data = await apiFetch<VerifyResetCodeResponse>('/verifyResetCode', {
        method: 'POST',
        body: JSON.stringify({
          userID: userID,
          code: code.trim(),
        }),
      });

      console.log('✅ Reset code verified:', data);

      // Store the verified code for final password reset
      await AsyncStorage.setItem(RESET_CODE_KEY, code.trim());

      return data;
    } catch (error: any) {
      console.error('❌ Code verification error:', error);
      throw error;
    }
  }

  /**
   * Step 3: Reset password with new password
   */
  async resetPassword(newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const userID = await AsyncStorage.getItem(RESET_USER_ID_KEY);
      const code = await AsyncStorage.getItem(RESET_CODE_KEY);

      if (!userID || !code) {
        throw new Error(
          'Invalid reset session. Please complete verification first.',
        );
      }

      console.log('🔒 Resetting password for user:', userID);

      const data = await apiFetch<ResetPasswordResponse>('/resetPassword', {
        method: 'POST',
        body: JSON.stringify({
          userID: userID,
          code: code,
          newPassword: newPassword,
        }),
      });

      console.log('✅ Password reset successful:', data);

      // Clear reset session after successful password reset
      await this.clearResetSession();

      return data;
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  }

  /**
   * Resend verification code (same as requesting reset again)
   */
  async resendCode(): Promise<RequestResetResponse> {
    const email = await AsyncStorage.getItem(RESET_EMAIL_KEY);

    if (!email) {
      throw new Error('No email found. Please start over.');
    }

    // Since backend doesn't have separate resend endpoint,
    // we call the request endpoint again
    return this.requestPasswordReset(email);
  }

  /**
   * Get stored reset session data
   */
  async getResetSessionData(): Promise<{
    userID: string | null;
    maskedEmail: string | null;
    code: string | null;
    recovered: boolean | null;
  }> {
    const userID = await AsyncStorage.getItem(RESET_USER_ID_KEY);
    const maskedEmail = await AsyncStorage.getItem(RESET_EMAIL_KEY);
    const code = await AsyncStorage.getItem(RESET_CODE_KEY);
    const recoveredRaw = await AsyncStorage.getItem(RESET_RECOVERED_KEY);
    const recovered = recoveredRaw === 'true' ? true : recoveredRaw === 'false' ? false : null;

    return { userID, maskedEmail, code, recovered };
  }

  /**
   * Clear password reset session
   */
  async clearResetSession(): Promise<void> {
    await AsyncStorage.multiRemove([
      RESET_USER_ID_KEY,
      RESET_CODE_KEY,
      RESET_EMAIL_KEY,
      '@password_reset_expiry',
      RESET_RECOVERED_KEY,
    ]);
    console.log('🧹 Password reset session cleared');
  }
}

// Export singleton instance
export const passwordResetService = new PasswordResetService();
