import OtpField from '@/components/auth/otp-field';
import { BottomButtonContainer } from '@/components/ui/bottom-button-container';
import CustomButton from '@/components/ui/custom-button';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

export default function EnterCodeSentScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [resendTime, setResendTime] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const isCodeComplete = code.length === 6;

  const handleBack = () => {
    router.back();
  };

  const handleVerify = async () => {
    if (isVerifying) return;

    // Validate code completion
    if (code.length !== 6) {
      Alert.alert(
        'Validation Error',
        'Please enter the complete 6-digit verification code.',
      );
      return;
    }

    setIsVerifying(true);

    try {
      // Simulate API call to verify code
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to reset password screen
      router.push('/login/forgot-password/reset-password');
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
  };

  const handleCodeFilled = (text: string) => {
    console.log('OTP Filled:', text);
    setCode(text);
  };

  const handleResend = async () => {
    if (isResendDisabled) return;

    try {
      // Simulate API call to resend code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset timer to 30 seconds
      setResendTime(30);
      setIsResendDisabled(true);
      setCode('');

      Alert.alert('Success', 'A new verification code has been sent.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  useEffect(() => {
    let timer: number;

    if (resendTime > 0 && isResendDisabled) {
      timer = window.setTimeout(() => {
        setResendTime((prev) => prev - 1);
      }, 1000);
    } else if (resendTime === 0) {
      setIsResendDisabled(false);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [resendTime, isResendDisabled]);

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
            disabled={isVerifying}
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
                {/* Email Icon */}
                <View className="w-12 h-12 rounded-full bg-blue-500/10 justify-center items-center mb-5">
                  <Ionicons
                    name="mail"
                    size={24}
                    color={colors.brand.primary}
                  />
                </View>

                {/* Title and Description */}
                <Text className="text-text-primary text-4xl font-geist-semibold text-center mb-4">
                  Enter verification code
                </Text>
                <Text className="text-text-muted text-md text-center font-geist-regular leading-[2] px-4 mb-[-10]">
                  Please enter the verification code we sent to your registered
                  email/phone number to continue.
                </Text>
              </View>

              {/* OTP Input Fields */}
              <View className="mb-8">
                <OtpField
                  value={code}
                  onChange={handleCodeChange}
                  onFilled={handleCodeFilled}
                  disabled={isVerifying}
                />
              </View>

              {/* Resend Code */}
              <View className="items-center mt-2">
                <Text className="text-text-secondary text-md text-center font-geist-regular">
                  Didn't receive a code?{' '}
                  <Text
                    className={`${isResendDisabled ? 'text-text-placeholder' : 'text-text-accent underline'}`}
                    onPress={isResendDisabled ? undefined : handleResend}
                  >
                    Resend
                  </Text>
                  {isResendDisabled && (
                    <Text className="text-text-placeholder">
                      {' '}
                      ({resendTime}s)
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Button */}
          <BottomButtonContainer>
            <CustomButton
              title={isVerifying ? 'Verifying...' : 'Continue'}
              onPress={handleVerify}
              variant="gradient-accent"
              size="lg"
              width="full"
              disabled={isVerifying}
            />
          </BottomButtonContainer>
        </KeyboardAvoidingView>

        <StatusBar style="light" />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
