import CustomButton from '@/components/ui/custom-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const params = useLocalSearchParams();

  const [email, setEmail] = useState((params.email as string) || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    code: false,
  });

  const handleGoBack = () => {
    router.back();
  };

  const isEmailValid = email.trim().includes('@') && email.trim().includes('.');
  const isFormValid = isEmailValid && verificationCode.length === 6;

  const handleSendCode = () => {
    if (isEmailValid) {
      // TODO: Send verification code to new email
      console.log('Sending code to:', email);
      setCodeSent(true);
      Alert.alert('Success', 'Verification code has been sent to your email.');
    }
  };

  const handleSave = () => {
    if (isFormValid) {
      // TODO: Verify code and update email in backend
      console.log('Verifying code:', verificationCode);
      console.log('Updating email to:', email);

      // Simulate verification
      Alert.alert('Success', 'Your email has been updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
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
                    onChangeText={setEmail}
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
                    editable={!codeSent}
                  />
                </View>
              </View>

              {/* Send Code Button */}
              {!codeSent && (
                <CustomButton
                  title="Send Verification Code"
                  onPress={handleSendCode}
                  variant={isEmailValid ? 'gradient-accent' : 'primary'}
                  size="lg"
                  width="full"
                  disabled={!isEmailValid}
                />
              )}

              {/* Verification Code Input */}
              {codeSent && (
                <>
                  <View>
                    <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                      Verification Code
                    </Text>
                    <View
                      className={`bg-gray-800 rounded-xl border h-16 px-4 justify-center ${isFocused.code ? 'border-blue-500' : 'border-gray-600'}`}
                    >
                      <TextInput
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        onFocus={() =>
                          setIsFocused((prev) => ({ ...prev, code: true }))
                        }
                        onBlur={() =>
                          setIsFocused((prev) => ({ ...prev, code: false }))
                        }
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="#6B7280"
                        keyboardType="number-pad"
                        className="text-gray-50 text-base font-geist-regular"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleSendCode}
                    className="self-center"
                  >
                    <Text className="text-blue-500 text-sm font-geist-medium">
                      Resend Code
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
                title="Save Changes"
                onPress={handleSave}
                variant={isFormValid ? 'gradient-accent' : 'primary'}
                size="lg"
                width="full"
                disabled={!isFormValid}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
