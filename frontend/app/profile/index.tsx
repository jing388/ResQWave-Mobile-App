import ChangeProfileSheet from '@/components/profile/change-profile-sheet';
import { Avatar } from '@/components/ui/avatar';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Lock,
  Logs,
} from 'lucide-react-native';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfile, updateProfilePicture, UserProfile } from '@/services/user-service';
import { API_BASE_URL } from '@/lib/api-client';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // User data state
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    const initializeProfile = async () => {
      await loadUserProfile();
      await requestPermissions();
    };
    
    initializeProfile().catch(error => {
      console.error('Failed to initialize profile:', error);
    });
  }, []);

  // Reload profile when screen comes into focus (from cache if available)
  useFocusEffect(
    useCallback(() => {
      // Reload profile from cache when returning to this screen
      loadUserProfile(false).catch(error => {
        console.error('Failed to reload profile on focus:', error);
      });
    }, [])
  );

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos. Please enable it in settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadUserProfile = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      // Pass forceRefresh option to bypass cache when needed
      const profile = await getProfile({ forceRefresh });
      setUserData(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Keep mock data as fallback
      setUserData({
        id: '1',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'juan.delacruz@email.com',
        phone: '+63 912 345 6789',
        lastPasswordChange: 'September 15, 2023',
        role: 'focalPerson',
      });
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Force refresh from API
      await loadUserProfile(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleAvatarPress = () => {
    bottomSheetRef.current?.present();
  };

  const handleCloseSheet = () => {
    bottomSheetRef.current?.dismiss();
  };

  const handleTakePhoto = async () => {
    try {
      setUploadingImage(true);
      
      // Check camera permissions first
      const permissionResult = await ImagePicker.getCameraPermissionsAsync();
      if (!permissionResult.granted) {
        const requestResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!requestResult.granted) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          const updatedUser = await updateProfilePicture(asset.uri);
          setUserData(updatedUser);
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          Alert.alert('Error', 'Unable to get image URI. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to take photo: ${errorMessage || 'Please try again.'}`);
    } finally {
      setUploadingImage(false);
      handleCloseSheet();
    }
  };

  const handleChoosePhoto = async () => {
    try {
      setUploadingImage(true);
      
      // Check media library permissions first
      const permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!requestResult.granted) {
          Alert.alert('Permission Required', 'Photo library permission is required to select photos.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          const updatedUser = await updateProfilePicture(asset.uri);
          setUserData(updatedUser);
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          Alert.alert('Error', 'Unable to get image URI. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error choosing photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to select photo: ${errorMessage || 'Please try again.'}`);
    } finally {
      setUploadingImage(false);
      handleCloseSheet();
    }
  };

  const handleEditName = () => {
    if (!userData) return;
    router.push({
      pathname: '/profile/first-and-last-name',
      params: {
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });
  };

  const handleEditPhone = () => {
    if (!userData) return;
    router.push({
      pathname: '/profile/phone-number',
      params: {
        phone: userData.phone,
      },
    });
  };

  const handleEditEmail = () => {
    if (!userData) return;
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

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      // Clear user data, tokens, etc.
      const { authService } = await import('@/services/auth-service');
      await authService.logout();
      // Navigate to homescreen
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to homescreen even if logout fails
      router.replace('/');
    }
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
                colors={['#3B82F6']}
              />
            }
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
                {loading ? (
                  <View className="w-24 h-24 bg-gray-600 rounded-full animate-pulse" />
                ) : (
                  <TouchableOpacity
                    onPress={handleAvatarPress}
                    activeOpacity={0.8}
                    disabled={uploadingImage}
                  >
                    <Avatar
                      size="xl"
                      imageSource={
                        userData?.photo && typeof userData.photo === 'string'
                          ? { uri: userData.photo.startsWith('http') ? userData.photo : `${API_BASE_URL}${userData.photo}` }
                          : require('@/assets/images/sample-profile-picture.jpg')
                      }
                    />
                    <View className="bg-default-primary absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center">
                      {uploadingImage ? (
                        <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera size={20} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
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
                      {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
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
                      {userData?.phone || 'Loading...'}
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
                      {userData?.email || 'Loading...'}
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
                      Last changed: {userData?.lastPasswordChange || 'Unknown'}
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
                      Last action: {userData?.lastPasswordChange || 'Unknown'}
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
