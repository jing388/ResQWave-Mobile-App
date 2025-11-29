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
import React from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutNeighborhoodScreen() {
  // Use custom hook for all state management and handlers
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
  } = useNeighborhoodData();

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
          onCancel={handleCancelEdit}
          onSubmit={handleSubmitEdit}
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
            Loading neighborhood data...
          </Text>
        </View>
      ) : !neighborhoodData ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-primary text-xl font-geist-semibold mb-2">
            No Data Available
          </Text>
          <Text className="text-text-muted text-base font-geist-regular text-center">
            Unable to load neighborhood information
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
    </SafeAreaView>
  );
}
