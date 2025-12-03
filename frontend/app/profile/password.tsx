import CustomButton from '@/components/ui/custom-button';
import PasswordGuide from '@/components/ui/password-guide';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
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
import { updatePassword } from '@/services/user-service';

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const isFormValid = () => {
    // Check all password requirements
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    return (
      currentPassword.length >= 6 &&
      hasMinLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar &&
      confirmPassword.length >= 8 &&
      newPassword === confirmPassword
    );
  };

  const handleChangePassword = async () => {
    if (!isFormValid()) {
      Alert.alert(
        'Error',
        'Please ensure all fields are filled correctly and new passwords match.',
      );
      return;
    }

    try {
      setLoading(true);
      await updatePassword(currentPassword, newPassword);
      console.log('Password changed successfully');
      Alert.alert('Success', 'Your password has been changed successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to change password:', error);
      Alert.alert('Error', 'Failed to change password. Please check your current password and try again.');
    } finally {
      setLoading(false);
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
                  Change Password
                </Text>
                <View style={{ width: 40 }} />
              </View>
            </View>

            {/* Form */}
            <View className="px-6">
              {/* Password Fields Group */}
              <View className="gap-6">
                {/* Current Password */}
                <View>
                  <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                    Current Password
                  </Text>
                  <View className="flex-row items-center bg-gray-800 rounded-xl h-16 px-4 border border-gray-600">
                    <TextInput
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor="#6B7280"
                      secureTextEntry={!showPasswords.current}
                      className="flex-1 text-gray-50 text-base h-full pr-2 font-geist-regular py-0"
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('current')}
                      className="p-2"
                    >
                      {showPasswords.current ? (
                        <EyeOff size={20} color="#9CA3AF" />
                      ) : (
                        <Eye size={20} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View>
                  <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                    New Password
                  </Text>
                  <View className="flex-row items-center bg-gray-800 rounded-xl h-16 px-4 border border-gray-600">
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor="#6B7280"
                      secureTextEntry={!showPasswords.new}
                      className="flex-1 text-gray-50 text-base h-full pr-2 font-geist-regular py-0"
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('new')}
                      className="p-2"
                    >
                      {showPasswords.new ? (
                        <EyeOff size={20} color="#9CA3AF" />
                      ) : (
                        <Eye size={20} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Guide */}
                <PasswordGuide password={newPassword} />

                {/* Confirm Password */}
                <View>
                  <Text className="text-gray-400 text-sm mb-2 font-geist-medium">
                    Confirm New Password
                  </Text>
                  <View className="flex-row items-center bg-gray-800 rounded-xl h-16 px-4 border border-gray-600">
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor="#6B7280"
                      secureTextEntry={!showPasswords.confirm}
                      className="flex-1 text-gray-50 text-base h-full pr-2 font-geist-regular py-0"
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('confirm')}
                      className="p-2"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={20} color="#9CA3AF" />
                      ) : (
                        <Eye size={20} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {confirmPassword.length > 0 &&
                    newPassword !== confirmPassword && (
                      <Text
                        className="text-xs mt-2 font-geist-regular"
                        style={{ color: '#EF4444' }}
                      >
                        Passwords do not match
                      </Text>
                    )}
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
              title={loading ? "Changing..." : "Change Password"}
              onPress={handleChangePassword}
              variant={isFormValid() ? 'gradient-accent' : 'primary'}
              size="lg"
              width="full"
              disabled={!isFormValid() || loading}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
