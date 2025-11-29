import { BottomButtonContainer } from '@/components/ui/bottom-button-container';
import CustomButton from '@/components/ui/custom-button';
import { CustomInput } from '@/components/ui/custom-input';
import PasswordGuide from '@/components/ui/password-guide';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const isPasswordValid =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const doPasswordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isPasswordValid && doPasswordsMatch;

  const handleBack = () => {
    router.back();
  };

  const handleResetPassword = async () => {
    if (isLoading) return;

    // Validate password requirements
    if (!isPasswordValid) {
      Alert.alert(
        'Invalid Password',
        'Password must meet all requirements: minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character.',
      );
      return;
    }

    // Validate passwords match
    if (!doPasswordsMatch) {
      Alert.alert(
        'Password Mismatch',
        'Passwords do not match. Please make sure both passwords are identical.',
      );
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login screen
              router.replace('/login');
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Gradient Background */}
        <LinearGradient
          colors={colors.gradients.background}
          className="absolute inset-0"
        />

        {/* Custom Header */}
        <View className="flex-row items-center justify-between p-5 pt-0 android:pt-5">
          <TouchableOpacity
            className="w-10 h-10 justify-center items-center"
            onPress={handleBack}
            disabled={isLoading}
          >
            <Image
              source={require('@/assets/images/left-arrow.png')}
              className="w-6 h-6"
              style={{ tintColor: colors.icon.primary }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View className="w-10" />
        </View>

        <KeyboardAvoidingView
          className="flex-1 relative"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 pt-5">
              {/* Header Section */}
              <View className="items-center mb-10">
                {/* Lock Icon */}
                <View className="w-12 h-12 rounded-full bg-blue-500/10 justify-center items-center mb-5">
                  <Lock size={24} color={colors.brand.primary} />
                </View>

                {/* Title and Description */}
                <Text className="text-text-primary text-4xl font-geist-semibold text-center mb-4">
                  Reset your password
                </Text>
                <Text className="text-text-muted text-md text-center font-geist-regular leading-[2] px-4 mb-[-10]">
                  Create a new password for your account. Make sure it's strong
                  and secure.
                </Text>
              </View>

              {/* Input Fields */}
              <View className="mb-6 gap-4">
                <CustomInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  icon={Lock}
                  isPassword
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <CustomInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  icon={Lock}
                  isPassword
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={
                    confirmPassword.length > 0 && !doPasswordsMatch
                      ? 'Passwords do not match'
                      : undefined
                  }
                />
              </View>

              {/* Password Guide - Always Visible */}
              <View className="mb-6">
                <PasswordGuide password={newPassword} />
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Button */}
          <BottomButtonContainer>
            <CustomButton
              title={isLoading ? 'Resetting...' : 'Reset Password'}
              onPress={handleResetPassword}
              variant="gradient-accent"
              size="lg"
              width="full"
              disabled={isLoading}
            />
          </BottomButtonContainer>
        </KeyboardAvoidingView>

        <StatusBar style="light" />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
