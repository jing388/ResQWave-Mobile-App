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
import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getLastSelectedNeighborhood,
} from '@/services/neighborhood-persistence';

export default function AboutNeighborhoodScreen() {
  // Get the neighborhoodId from the URL parameters
  const { neighborhoodId: urlNeighborhoodId } = useLocalSearchParams<{ neighborhoodId?: string }>();
  
  // State for managing the neighborhood ID to use (from URL or persisted)
  const [effectiveNeighborhoodId, setEffectiveNeighborhoodId] = useState<string | null | undefined>(undefined);
  const [isLoadingPersisted, setIsLoadingPersisted] = useState(true);

  // Load persisted neighborhood ID if no neighborhoodId is provided in URL
  useEffect(() => {
    const loadPersistedNeighborhood = async () => {
      if (!urlNeighborhoodId) {
        console.log('No neighborhoodId in URL, checking for persisted neighborhood...');
        const persistedId = await getLastSelectedNeighborhood();
        if (persistedId) {
          console.log('Found persisted neighborhood:', persistedId);
          setEffectiveNeighborhoodId(persistedId);
        } else {
          console.log('No persisted neighborhood found');
          setEffectiveNeighborhoodId(null); // Use null instead of undefined
        }
      } else {
        console.log('Using neighborhoodId from URL:', urlNeighborhoodId);
        setEffectiveNeighborhoodId(urlNeighborhoodId);
      }
      setIsLoadingPersisted(false);
    };

    loadPersistedNeighborhood();
  }, [urlNeighborhoodId]);

  // If we have a persisted neighborhood ID but no URL parameter, update the URL
  useEffect(() => {
    if (effectiveNeighborhoodId && !urlNeighborhoodId && !isLoadingPersisted) {
      console.log('Updating URL with persisted neighborhood ID:', effectiveNeighborhoodId);
      router.replace({
        pathname: '/(tabs)/about-neighborhood',
        params: { neighborhoodId: effectiveNeighborhoodId }
      });
    }
  }, [effectiveNeighborhoodId, urlNeighborhoodId, isLoadingPersisted]);
  
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
  } = useNeighborhoodData(effectiveNeighborhoodId);

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

      {(isLoading || isLoadingPersisted) ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.status.info} />
          <Text className="text-text-muted text-base font-geist-regular mt-4">
            Loading neighborhood data...
          </Text>
        </View>
      ) : !neighborhoodData ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-primary text-xl font-geist-semibold mb-2">
            No Neighborhood Selected
          </Text>
          <Text className="text-text-muted text-base font-geist-regular text-center mb-4">
            Please select a neighborhood on the map to view detailed information
          </Text>
          <Text className="text-text-secondary text-sm font-geist-regular text-center">
            Go to the Map tab and tap on any neighborhood marker to see its details here
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
    </SafeAreaView>
  );
}
