import { BottomButtonContainer } from '@/components/ui/bottom-button-container';
import CustomButton from '@/components/ui/custom-button';
import { CustomInput } from '@/components/ui/custom-input';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, Search } from 'lucide-react-native';
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

export default function FindYourAccountScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleFindAccount = async () => {
    if (isLoading) return;

    // Validate identifier
    if (!identifier.trim()) {
      Alert.alert(
        'Validation Error',
        'Please enter your email address or phone number.',
      );
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to find account
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to enter code sent screen
      router.push('/login/forgot-password/enter-code-sent');
    } catch (error) {
      Alert.alert('Error', 'Unable to find account. Please try again.');
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
                {/* Search Icon */}
                <View className="w-12 h-12 rounded-full bg-blue-500/10 justify-center items-center mb-5">
                  <Search size={24} color={colors.brand.primary} />
                </View>

                {/* Title and Description */}
                <Text className="text-text-primary text-4xl font-geist-semibold text-center mb-4">
                  Find your account
                </Text>
                <Text className="text-text-muted text-md text-center font-geist-regular leading-[2] px-4 mb-[-10]">
                  Enter your email address or phone number associated with your
                  account to receive a verification code.
                </Text>
              </View>

              {/* Input Field */}
              <View className="mb-6">
                <CustomInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="Email address or phone number"
                  icon={Mail}
                  editable={!isLoading}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Button */}
          <BottomButtonContainer>
            <CustomButton
              title={isLoading ? 'Searching...' : 'Continue'}
              onPress={handleFindAccount}
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
