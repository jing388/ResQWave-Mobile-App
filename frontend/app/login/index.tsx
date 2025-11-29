import { BottomButtonContainer } from '@/components/ui/bottom-button-container';
import CustomButton from '@/components/ui/custom-button';
import { CustomInput } from '@/components/ui/custom-input';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/use-auth';
import { validateIdentifier, validatePassword } from '@/utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Lock, Mail } from 'lucide-react-native';
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate identifier
    const identifierValidation = validateIdentifier(identifier);
    if (!identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    } else if (!identifierValidation.isValid) {
      newErrors.identifier = 'Please enter a valid email or phone number';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    const identifierValidation = validateIdentifier(identifier);
    return identifierValidation.isValid && validatePassword(password);
  };

  const handleLogin = async () => {
    // Mark that user has attempted to submit
    setAttemptedSubmit(true);

    // Clear previous API errors
    clearError();

    // Validate form
    if (!validateForm()) {
      // Validation errors are already set in state
      // The CustomInput components will display them
      return;
    }

    try {
      const response = await login(identifier, password);

      // Navigate to verification screen with tempToken
      router.push({
        pathname: '/verification',
        params: {
          tempToken: response.tempToken,
          identifier: identifier,
        },
      });
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please try again');
    }
  };

  const handleForgotPassword = () => {
    router.push('/login/forgot-password/find-your-account');
  };

  const handleBack = () => {
    router.replace('/');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <LinearGradient
          colors={colors.gradients.background}
          className="absolute inset-0"
        />

        {/* Header */}
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
            <View className="flex-1 px-6">
              {/* Logo and Title */}
              <View className="items-center mb-10">
                <View className="w-20 h-20 justify-center items-center mb-2">
                  <Image
                    source={require('@/assets/images/resqwave-logo.png')}
                    className="w-14 h-14"
                  />
                </View>
                <Text className="text-text-primary text-4xl font-geist-semibold mb-4 text-center">
                  Log in to ResQWave
                </Text>
              </View>

              {/* Global Error Message (from API) */}
              {error && (
                <View className="bg-status-error/10 border border-status-error rounded-xl p-4 mb-6">
                  <Text className="text-status-error text-sm font-geist-regular">
                    {error}
                  </Text>
                </View>
              )}

              {/* Form */}
              <View className="gap-6 mb-8">
                <CustomInput
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    // Clear error when user starts typing (only if they've attempted submit)
                    if (attemptedSubmit) {
                      setErrors((prev) => ({ ...prev, identifier: undefined }));
                    }
                  }}
                  placeholder="Enter phone number or email"
                  icon={Mail}
                  error={attemptedSubmit ? errors.identifier : undefined}
                  editable={!isLoading}
                />

                <CustomInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Clear error when user starts typing (only if they've attempted submit)
                    if (attemptedSubmit) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Enter your password"
                  icon={Lock}
                  isPassword
                  error={attemptedSubmit ? errors.password : undefined}
                  editable={!isLoading}
                />

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  className="self-center p-2"
                  disabled={isLoading}
                >
                  <Text className="text-text-secondary text-md font-geist-regular">
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Button - Always Enabled */}
          <BottomButtonContainer>
            <CustomButton
              title={isLoading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              variant="gradient-accent"
              size="lg"
              width="full"
              disabled={isLoading} // Only disable during loading
            />
          </BottomButtonContainer>
        </KeyboardAvoidingView>

        <StatusBar style="light" />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
