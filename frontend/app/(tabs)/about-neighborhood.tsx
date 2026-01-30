import {
  AnimatedHeader,
  StaticHeader,
} from '@/components/neighborhood/animated-header';
import { NeighborhoodEdit } from '@/components/neighborhood/neighborhood-edit';
import { NeighborhoodView } from '@/components/neighborhood/neighborhood-view';
import { DetailRow } from '@/components/ui/detail-row';
import { InfoCard } from '@/components/ui/info-card';
import { Separator } from '@/components/ui/separator';
import { colors } from '@/constants/colors';
import { useNeighborhoodData } from '@/hooks/use-neighborhood-data';
import { formatDate } from '@/utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StatusBar, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radio, Edit2 } from 'lucide-react-native';

export default function AboutNeighborhoodScreen() {
  // For data privacy compliance, this page ONLY shows the user's OWN neighborhood
  // No URL params needed - we always fetch from /neighborhood/own endpoint
  
  // Use custom hook for all state management and handlers
  // Pass null to always fetch user's own neighborhood
  const {
    isEditMode,
    isLoading,
    neighborhoodData,
    editedData,
    dropdownOptions,
    handleEditPress,
    handleCancelEdit,
    handleSubmitEdit,
    handleDropdownChange,
    handleHazardToggle,
    handleNotableInfoChange,
    handleAlternativeFocalChange,
  } = useNeighborhoodData(null); // Always fetch own neighborhood

  // Reanimated values for header
  const scrollY = useSharedValue(0);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Render content based on edit mode
  const renderContent = () => {
    if (!neighborhoodData) return null;

    if (isEditMode) {
      return (
        <NeighborhoodEdit
          neighborhoodData={neighborhoodData}
          editedData={editedData}
          dropdownOptions={dropdownOptions}
          onDropdownChange={handleDropdownChange}
          onHazardToggle={handleHazardToggle}
          onNotableInfoChange={handleNotableInfoChange}
          onAlternativeFocalChange={handleAlternativeFocalChange}
        />
      );
    }

    // View mode
    return (
      <NeighborhoodView
        neighborhoodData={neighborhoodData}
        DetailRow={DetailRow}
        InfoCard={InfoCard}
        Separator={Separator}
      />
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-app-bg-secondary"
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={colors.gradients.background}
        className="absolute inset-0"
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.status.info} />
          <Text className="text-text-muted text-base font-geist-regular mt-4">
            Loading your neighborhood data...
          </Text>
        </View>
      ) : !neighborhoodData ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-primary text-xl font-geist-semibold mb-2">
            No Neighborhood Assigned
          </Text>
          <Text className="text-text-muted text-base font-geist-regular text-center mb-4">
            You don't have a neighborhood assigned to your account yet.
          </Text>
          <Text className="text-text-secondary text-sm font-geist-regular text-center mb-4">
            Tap your neighborhood marker on the Map tab and use the green button to view details.
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
        >
          {/* Header Image */}
          <View className="w-full">
            <Image
              source={require('@/assets/images/about-neigh-header-pic.png')}
              className="w-full h-32"
              resizeMode="cover"
            />
          </View>

          {/* Main Content Container */}
          <View style={{ backgroundColor: '#171717' }} className="flex-1">
            {/* Neighborhood Title Section */}
            <View className="px-5 pt-5 pb-1">
              <View className="flex-row items-center gap-2 mb-2">
                <Radio size={18} color="#60A5FA" />
                <Text className="text-white text-xl font-geist-bold">
                  {neighborhoodData.name}
                </Text>
              </View>
              <Text className="text-gray-400 text-xs font-geist-regular mb-4">
                Last Updated: {formatDate(neighborhoodData.lastUpdatedAt)}
              </Text>
            </View>

            {/* Edit Information Button */}
            {!isEditMode && (
              <View className="px-5 py-7 pb-5">
                <TouchableOpacity
                  style={{ backgroundColor: '#3B82F6' }}
                  className="rounded-lg py-4.5 flex-row items-center justify-center gap-2"
                  onPress={handleEditPress}
                  activeOpacity={0.8}
                >
                  <Edit2 size={16} color="#ffffff" />
                  <Text className="text-white text-sm font-geist-semibold">
                    Edit Information
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Cancel/Submit Buttons in Edit Mode */}
            {isEditMode && (
              <View className="px-6 pb-6 flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-600 rounded-lg py-4"
                  onPress={handleCancelEdit}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-base font-geist-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-green-500 rounded-lg py-4"
                  onPress={handleSubmitEdit}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-base font-geist-semibold text-center">
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Dynamic Content */}
            {renderContent()}

            {/* Bottom Padding */}
            <View className="h-8" />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
