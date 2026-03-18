import CustomButton from '@/components/ui/custom-button';
import OtpField from '@/components/auth/otp-field';
import { requestEmailChangeOTP, verifyEmailChangeOTP } from '@/services/user-service';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditEmailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState((params.email as string) || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState({
    email: false,
  });

  const handleGoBack = () => {
    router.back();
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isEmailValid && verificationCode.length === 6;

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'Something went wrong. Please try again.';
  };

  const handleSendCode = async () => {
    if (!isEmailValid || isSending) return;
    setError('');
    setIsSending(true);
    try {
      await requestEmailChangeOTP(email);
      setCodeSent(true);
      setVerificationCode('');
      setOtpKey((k) => k + 1);
      Alert.alert('Success', 'Verification code has been sent to your email.');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = async () => {
    if (!isFormValid || isVerifying) return;
    setError('');
    setIsVerifying(true);
    try {
      await verifyEmailChangeOTP(verificationCode);
      Alert.alert('Success', 'Your email has been updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Backdrop - tap to close */}
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={handleGoBack}
      />

      {/* Content - slides from right */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        {/* Gradient Background */}
        <LinearGradient
          colors={['#1F2937', '#171717']}
          className="absolute inset-0"
        />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ paddingTop: insets.top + 16 }} className="px-5">
              <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity
                  onPress={handleGoBack}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-geist-semibold">
                  Edit Email
                </Text>
                <View style={{ width: 40 }} />
              </View>
            </View>

            {/* Form */}
            <View className="px-6 gap-6">
              {/* Email Input */}
              <View>
                <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                  Email Address
                </Text>
                <View
                  className={`bg-gray-800 rounded-xl border h-16 px-4 justify-center ${isFocused.email ? 'border-blue-500' : 'border-gray-600'}`}
                >
                  <TextInput
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      if (error) setError('');
                    }}
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, email: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, email: false }))
                    }
                    placeholder="Enter your email address"
                    placeholderTextColor="#6B7280"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="text-gray-50 text-base font-geist-regular"
                    editable={!codeSent && !isSending && !isVerifying}
                  />
                </View>
                {!!error && (
                  <Text className="text-red-400 text-xs mt-2 font-geist-regular">
                    {error}
                  </Text>
                )}
              </View>

              {/* Send Code Button */}
              {!codeSent && (
                <CustomButton
                  title={isSending ? 'Sending...' : 'Send Verification Code'}
                  onPress={handleSendCode}
                  variant={isEmailValid ? 'gradient-accent' : 'primary'}
                  size="lg"
                  width="full"
                  disabled={!isEmailValid || isSending || isVerifying}
                />
              )}

              {/* Verification Code Input */}
              {codeSent && (
                <>
                  <View>
                    <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                      Verification Code
                    </Text>
                    <View className="w-full">
                      <OtpField
                        key={otpKey}
                        value={verificationCode}
                        onChange={(text) => {
                          const v = text.replace(/\D+/g, '').slice(0, 6);
                          setVerificationCode(v);
                          if (error) setError('');
                        }}
                        onFilled={(text) => {
                          const v = text.replace(/\D+/g, '').slice(0, 6);
                          setVerificationCode(v);
                        }}
                        disabled={isSending || isVerifying}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleSendCode}
                    className="self-center"
                    disabled={isSending || isVerifying}
                  >
                    <Text className="text-blue-500 text-sm font-geist-medium">
                      {isSending ? 'Resending...' : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>

          {/* Fixed Bottom Button */}
          {codeSent && (
            <View
              style={{
                padding: 20,
                paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 20,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <CustomButton
                title={isVerifying ? 'Verifying...' : 'Save Changes'}
                onPress={handleSave}
                variant={isFormValid ? 'gradient-accent' : 'primary'}
                size="lg"
                width="full"
                disabled={!isFormValid || isSending || isVerifying}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
