import CustomButton from '@/components/ui/custom-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
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
import { updateProfile } from '@/services/user-service';

export default function EditNameScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const params = useLocalSearchParams();

  const [firstName, setFirstName] = useState(
    (params.firstName as string) || '',
  );
  const [lastName, setLastName] = useState((params.lastName as string) || '');
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
  });
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const isFormValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleSave = async () => {
    if (isFormValid) {
      try {
        setLoading(true);
        await updateProfile({ firstName, lastName });
        console.log('Name updated successfully:', { firstName, lastName });
        router.back();
      } catch (error) {
        console.error('Failed to update name:', error);
        // You could show an error message to the user here
      } finally {
        setLoading(false);
      }
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
                  Edit Name
                </Text>
                <View style={{ width: 40 }} />
              </View>
            </View>

            {/* Form */}
            <View className="px-6 gap-6">
              {/* First Name Input */}
              <View>
                <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                  First Name
                </Text>
                <View
                  className={`bg-gray-800 rounded-xl border h-16 px-4 justify-center ${isFocused.firstName ? 'border-blue-500' : 'border-gray-600'}`}
                >
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, firstName: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, firstName: false }))
                    }
                    placeholder="Enter your first name"
                    placeholderTextColor="#6B7280"
                    className="text-gray-50 text-base font-geist-regular"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Last Name Input */}
              <View>
                <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                  Last Name
                </Text>
                <View
                  className={`bg-gray-800 rounded-xl border h-16 px-4 justify-center ${isFocused.lastName ? 'border-blue-500' : 'border-gray-600'}`}
                >
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, lastName: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, lastName: false }))
                    }
                    placeholder="Enter your last name"
                    placeholderTextColor="#6B7280"
                    className="text-gray-50 text-base font-geist-regular"
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Button */}
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
              title={loading ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              variant={isFormValid ? 'gradient-accent' : 'primary'}
              size="lg"
              width="full"
              disabled={!isFormValid || loading}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
