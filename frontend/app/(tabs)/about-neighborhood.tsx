import {
  AnimatedHeader,
  StaticHeader,
} from '@/components/neighborhood/animated-header';
import { NeighborhoodEdit } from '@/components/neighborhood/neighborhood-edit';
import { NeighborhoodView } from '@/components/neighborhood/neighborhood-view';
import { RefreshNotification } from '@/components/ui/refresh-notification';
import { DetailRow } from '@/components/ui/detail-row';
import { InfoCard } from '@/components/ui/info-card';
import { Separator } from '@/components/ui/separator';
import { colors } from '@/constants/colors';
import { useNeighborhoodData } from '@/hooks/use-neighborhood-data';
import { formatDate } from '@/utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    notification,
    dismissNotification,
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
        <>
          {/* Animated Sticky Header */}
          {neighborhoodData && (
            <AnimatedHeader
              scrollY={scrollY}
              neighborhoodData={neighborhoodData}
              isEditMode={isEditMode}
              onEditPress={handleEditPress}
              onCancelEdit={handleCancelEdit}
              onSubmitEdit={handleSubmitEdit}
            />
          )}

          <Animated.ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 0 }}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
          >
            {/* Header Section */}
            <View className="px-6 py-6">
              <Text className="text-text-primary text-3xl font-geist-bold mb-2">
                About Your Neighborhood
              </Text>
              <Text className="text-text-muted text-base font-geist-regular">
                View and manage neighborhood information
              </Text>
            </View>

            {/* Static Header Section */}
            {neighborhoodData && (
              <StaticHeader
                neighborhoodData={neighborhoodData}
                isEditMode={isEditMode}
                onEditPress={handleEditPress}
                onCancelEdit={handleCancelEdit}
                onSubmitEdit={handleSubmitEdit}
              />
            )}

            {/* Dynamic Content */}
            {renderContent()}

            {/* Footer */}
            {neighborhoodData && (
              <View className="px-6 pb-6">
                <Text className="text-text-secondary text-xs font-geist-regular text-center">
                  Data last updated:{' '}
                  {formatDate(neighborhoodData.lastUpdatedAt)}
                </Text>
              </View>
            )}
          </Animated.ScrollView>
        </>
      )}

      {/* Notification */}
      <RefreshNotification
        visible={notification.visible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onDismiss={dismissNotification}
      />
    </SafeAreaView>
  );
}
