import ChangeProfileSheet from '@/components/profile/change-profile-sheet';
import { Avatar } from '@/components/ui/avatar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Lock,
  Logs,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // User data state
  const [userData, setUserData] = useState({
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '+63 912 345 6789',
    lastPasswordChange: 'September 15, 2023',
  });

  const handleGoBack = () => {
    router.back();
  };

  const handleAvatarPress = () => {
    bottomSheetRef.current?.present();
  };

  const handleCloseSheet = () => {
    bottomSheetRef.current?.dismiss();
  };

  const handleTakePhoto = () => {
    console.log('Take photo');
    handleCloseSheet();
    // Implement camera functionality here
  };

  const handleChoosePhoto = () => {
    console.log('Choose photo');
    handleCloseSheet();
    // Implement photo picker functionality here
  };

  const handleEditName = () => {
    router.push({
      pathname: '/profile/first-and-last-name',
      params: {
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });
  };

  const handleEditPhone = () => {
    router.push({
      pathname: '/profile/phone-number',
      params: {
        phone: userData.phone,
      },
    });
  };

  const handleEditEmail = () => {
    router.push({
      pathname: '/profile/email',
      params: {
        email: userData.email,
      },
    });
  };

  const handleChangePassword = () => {
    router.push('/profile/password');
  };

  const handleViewLogs = () => {
    router.push('/profile/logs');
  };

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    console.log('Signing out...');
    // Clear user data, tokens, etc.
    router.replace('/login');
  };

  return (
    <BottomSheetModalProvider>
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

        {/* Profile Content - slides from right */}
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

          {/* Content */}
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button and Title */}
            <View style={{ paddingTop: insets.top + 16 }}>
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  onPress={handleGoBack}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-geist-semibold">
                  Profile
                </Text>
                <View style={{ width: 40 }} />
              </View>

              <View className="items-center mb-8">
                <TouchableOpacity
                  onPress={handleAvatarPress}
                  activeOpacity={0.8}
                >
                  <Avatar
                    size="xl"
                    imageSource={require('@/assets/images/sample-profile-picture.jpg')}
                  />
                  <View className="bg-default-primary absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center">
                    <Camera size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Personal Information */}
            <View className="mb-6">
              <Text className="text-text-muted text-sm font-geist-medium mb-4 pl-2 spacing-10 tracking-wide">
                PERSONAL INFORMATION
              </Text>

              {/* Full Name */}
              <TouchableOpacity
                onPress={handleEditName}
                className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-600"
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-1 font-geist-regular">
                      Name
                    </Text>
                    <Text className="text-gray-50 text-base font-geist-medium">
                      {userData.firstName} {userData.lastName}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {/* Phone Number */}
              <TouchableOpacity
                onPress={handleEditPhone}
                className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-600"
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-1 font-geist-regular">
                      Phone Number
                    </Text>
                    <Text className="text-gray-50 text-base font-geist-medium">
                      {userData.phone}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                onPress={handleEditEmail}
                className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-600"
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-1 font-geist-regular">
                      Email
                    </Text>
                    <Text className="text-gray-50 text-base font-geist-medium">
                      {userData.email}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Password Section */}
            <View className="mb-8">
              <Text className="text-text-muted text-sm font-geist-medium mb-4 pl-2 spacing-10 tracking-wide">
                SECURITY
              </Text>

              <TouchableOpacity
                onPress={handleChangePassword}
                className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-600"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 bg-default-primary/20">
                    <Lock size={20} color={'#3B82F6'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-50 text-base font-geist-medium">
                      Password
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1 font-geist-regular">
                      Last changed: {userData.lastPasswordChange}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleViewLogs}
                className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-600"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 bg-default-primary/20">
                    <Logs size={20} color={'#3B82F6'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-50 text-base font-geist-medium">
                      Logs
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1 font-geist-regular">
                      Last action: {userData.lastPasswordChange}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Fixed Bottom Sign Out Button */}
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
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-gray-800 p-4 rounded-xl border border-gray-600"
              activeOpacity={0.7}
            >
              <Text className="text-red-500 text-base font-geist-medium text-center">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Sheet for Avatar Options */}
        <ChangeProfileSheet
          bottomSheetRef={bottomSheetRef}
          onTakePhoto={handleTakePhoto}
          onChoosePhoto={handleChoosePhoto}
        />
      </View>
    </BottomSheetModalProvider>
  );
}
