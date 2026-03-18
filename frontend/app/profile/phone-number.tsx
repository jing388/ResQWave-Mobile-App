import CustomButton from '@/components/ui/custom-button';
import OtpField from '@/components/auth/otp-field';
import { requestNumberChangeOTP, verifyNumberChangeOTP } from '@/services/user-service';
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

export default function EditPhoneScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [phoneNumber, setPhoneNumber] = useState(
    (params.phone as string) || '',
  );
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState({
    phone: false,
  });

  const handleGoBack = () => {
    router.back();
  };

  const digitsOnly = phoneNumber.replace(/\D+/g, '');
  const isPhoneValid =
    (/^0\d{10}$/.test(digitsOnly) || /^9\d{9}$/.test(digitsOnly)) &&
    digitsOnly.length >= 10;
  const isFormValid = isPhoneValid && verificationCode.length === 6;

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'Something went wrong. Please try again.';
  };

  const handlePhoneChange = (value: string) => {
    const v = value.replace(/\D+/g, '').slice(0, 11);
    setPhoneNumber(v);
    if (error) setError('');
  };

  const handleSendCode = async () => {
    if (!isPhoneValid || isSending) return;
    setError('');
    setIsSending(true);
    try {
      await requestNumberChangeOTP(phoneNumber);
      setCodeSent(true);
      setVerificationCode('');
      setOtpKey((k) => k + 1);
      Alert.alert('Success', 'Verification code has been sent to your phone number.');
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
      await verifyNumberChangeOTP(verificationCode);
      Alert.alert('Success', 'Your phone number has been updated successfully!', [
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
                  Edit Phone Number
                </Text>
                <View style={{ width: 40 }} />
              </View>
            </View>

            {/* Form */}
            <View className="px-6 gap-6">
              {/* Phone Number Input */}
              <View>
                <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                  Phone Number
                </Text>
                <View
                  className={`flex-row items-center bg-gray-800 rounded-xl border h-16 ${isFocused.phone ? 'border-blue-500' : 'border-gray-600'}`}
                >
                  <View className="flex-row items-center h-8 px-5 border-r border-gray-600">
                    <Text className="text-gray-50 text-base font-geist-medium mr-2">
                      🇵🇭
                    </Text>
                    <Text className="text-gray-50 text-base font-geist-medium">
                      +63
                    </Text>
                  </View>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, phone: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, phone: false }))
                    }
                    placeholder="Enter your phone number"
                    placeholderTextColor="#6B7280"
                    keyboardType="phone-pad"
                    className="flex-1 text-gray-50 text-base h-full ml-3 font-geist-regular py-0 pr-3"
                    maxLength={11}
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
                  variant={isPhoneValid ? 'gradient-accent' : 'primary'}
                  size="lg"
                  width="full"
                  disabled={!isPhoneValid || isSending || isVerifying}
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
