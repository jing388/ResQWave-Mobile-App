import { BottomButtonContainer } from '@/components/ui/bottom-button-container';
import { AuthLoadingOverlay } from '@/components/ui/auth-loading-overlay';
import CustomButton from '@/components/ui/custom-button';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/use-auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { OtpInput } from 'react-native-otp-entry';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyCode, resendCode, isLoading } = useAuth();

  const tempToken = params.tempToken as string;
  const identifier = params.identifier as string;
  const [code, setCode] = useState('');
  const [resendTime, setResendTime] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<number | undefined>(undefined);
  const [loadingMessage, setLoadingMessage] = useState<string>('Signing in...');
  const scale = useSharedValue(1);

  const isCodeComplete = code.length === 6;

  const handleBack = () => {
    router.replace('/login');
  };

  const handleVerify = async () => {
    if (!isCodeComplete || isLoading) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    try {
      setLoadingMessage('Signing in...');
      setLoadingProgress(8);
      timer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (typeof prev !== 'number') return 8;
          if (prev >= 92) return prev;
          return prev + 1;
        });
      }, 140);

      // Call the verify API with tempToken and code
      const response = await verifyCode(tempToken, code);

      setLoadingProgress(100);

      // Show success state
      setVerificationSuccess(true);

      // Animate the OTP inputs to green
      scale.value = withTiming(1.1, { duration: 200 });

      // Check if user is new and needs onboarding
      setTimeout(() => {
        try {
          console.log('🚀 Navigating after verification success...');
          console.log('📦 User data:', JSON.stringify(response.user, null, 2));

          if (response.user?.newUser) {
            // Navigate to onboarding with user details
            // Use the focal person's address instead of terminal info
            const userLocation = response.user.addressText || response.user.address || 'your neighborhood';

            // Use firstName if available, otherwise fall back to name or 'User'
            const userName = response.user.firstName || response.user.name || 'User';

            console.log('➡️ Navigating to onboarding...');
            router.replace({
              pathname: '/onboarding',
              params: {
                userName: userName,
                neighborhoodName: userLocation,
                userAddress: response.user.addressText || response.user.address || '',
              },
            });
          } else {
            console.log('➡️ Navigating to tabs (main app)...');
            router.replace({
              pathname: '/(tabs)',
              params: { freshLogin: 'true' },
            });
          }
        } catch (navError: any) {
          console.error('❌ Navigation error:', navError);
          Alert.alert(
            'Navigation Error',
            'Failed to navigate to main screen. Please restart the app.',
          );
        }
      }, 1000);
    } catch (error: any) {
      console.error('Verification failed:', error);
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid verification code. Please try again.',
      );
    } finally {
      if (timer) clearInterval(timer);
      setTimeout(() => setLoadingProgress(undefined), 250);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
  };

  const handleResend = async () => {
    if (isResendDisabled || isLoading) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    try {
      setLoadingMessage('Resending code...');
      setLoadingProgress(10);
      timer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (typeof prev !== 'number') return 10;
          if (prev >= 90) return prev;
          return prev + 1;
        });
      }, 160);

      // Call the resend API
      await resendCode(tempToken);

      setLoadingProgress(100);

      // Reset timer to 30 seconds
      setResendTime(30);
      setIsResendDisabled(true);

      Alert.alert('Success', 'Verification code has been resent to your email');
    } catch (error: any) {
      console.error('Resend failed:', error);
      Alert.alert(
        'Resend Failed',
        error.message || 'Failed to resend code. Please try again.',
      );
    } finally {
      if (timer) clearInterval(timer);
      setTimeout(() => setLoadingProgress(undefined), 250);
    }
  };

  useEffect(() => {
    let timer: number;

    if (resendTime > 0 && isResendDisabled) {
      timer = setTimeout(() => {
        setResendTime((prev) => prev - 1);
      }, 1000);
    } else if (resendTime === 0) {
      setIsResendDisabled(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendTime, isResendDisabled]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView
        className="flex-1 bg-zinc-900"
        edges={['top', 'left', 'right']}
      >
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 pt-5">
              {/* Verification Content */}
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
                  number/email to continue.
                </Text>
              </View>

              {/* OTP Input Fields */}
              <View className="mb-8">
                {verificationSuccess ? (
                  <Animated.View
                    className="flex-row justify-center gap-2"
                    style={{ transform: [{ scale: scale }] }}
                  >
                    {[...Array(6)].map((_, index) => (
                      <View
                        key={index}
                        className="w-[46] h-[60] rounded-lg bg-default-green justify-center items-center"
                      >
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.icon.primary}
                        />
                      </View>
                    ))}
                  </Animated.View>
                ) : (
                  <OtpInput
                    numberOfDigits={6}
                    focusColor={colors.brand.primary}
                    focusStickBlinkingDuration={500}
                    onTextChange={handleCodeChange}
                    onFilled={(text) => {
                      console.log('OTP Filled:', text);
                      setCode(text);
                    }}
                    textInputProps={{
                      accessibilityLabel: 'One-Time Password',
                    }}
                    theme={{
                      containerStyle: {
                        width: '100%',
                      },
                      inputsContainerStyle: {
                        gap: 8,
                        justifyContent: 'center',
                      },
                      pinCodeContainerStyle: {
                        backgroundColor: colors.background.secondary,
                        borderColor: isCodeComplete
                          ? colors.brand.primary
                          : colors.card.border,
                        borderWidth: 1,
                        borderRadius: 8,
                        width: 46,
                        height: 60,
                      },
                      pinCodeTextStyle: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: colors.text.primary,
                      },
                      focusStickStyle: {
                        backgroundColor: colors.brand.primary,
                        width: 2,
                        height: 32,
                      },
                      focusedPinCodeContainerStyle: {
                        borderColor: colors.brand.primary,
                        backgroundColor: colors.background.secondary,
                      },
                    }}
                  />
                )}
              </View>

              {/* Resend Code */}
              <View className="items-center mt-2">
                <Text className="text-text-secondary text-md text-center font-geist-regular">
                  Didn’t receive any code?{' '}
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
        </KeyboardAvoidingView>

        {/* Fixed Bottom Button */}
        <BottomButtonContainer>
          <CustomButton
            title={
              isLoading
                ? 'Verifying...'
                : verificationSuccess
                  ? 'Success!'
                  : 'Verify'
            }
            onPress={handleVerify}
            variant={isCodeComplete ? 'gradient-accent' : 'primary'}
            size="lg"
            width="full"
            disabled={!isCodeComplete || isLoading || verificationSuccess}
          />
        </BottomButtonContainer>

        <StatusBar style="light" />

        <AuthLoadingOverlay
          visible={isLoading}
          message={loadingMessage}
          progress={loadingProgress}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
