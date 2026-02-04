import { NeighborhoodEdit } from '@/components/neighborhood/neighborhood-edit';
import { NeighborhoodView } from '@/components/neighborhood/neighborhood-view';
import { RefreshNotification } from '@/components/ui/refresh-notification';
import { DetailRow } from '@/components/ui/detail-row';
import { InfoCard } from '@/components/ui/info-card';
import { Separator } from '@/components/ui/separator';
import { colors } from '@/constants/colors';
import { useNeighborhoodData } from '@/hooks/use-neighborhood-data';
import { formatDate } from '@/utils/formatters';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StatusBar, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Radio, Edit } from 'lucide-react-native';
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
    isSubmitting,
  } = useNeighborhoodData(null); // Always fetch own neighborhood

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
      className="flex-1"
      style={{ backgroundColor: '#171717' }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
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
            You do not have a neighborhood assigned to your account yet.
          </Text>
          <Text className="text-text-secondary text-sm font-geist-regular text-center mb-4">
            Tap your neighborhood marker on the Map tab and use the green button to view details.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 0 }}
          >
            {/* Hero Image Section */}
            <View className="w-full h-48">
              <Image
                source={require('@/assets/images/about-neigh-header-pic.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Terminal Name Section */}
            <View className="px-6 pt-6 pb-2" style={{ backgroundColor: '#171717' }}>
              <View className="flex-row items-start gap-3 mb-3">
                <View style={{ backgroundColor: '#1D1D1D' }} className="rounded-lg p-3">
                  <Radio size={22} color={colors.brand.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-2xl font-geist-semibold">
                    {neighborhoodData.name}
                  </Text>
                </View>
              </View>
              
              <Text className="text-gray-400 text-sm font-geist-regular mb-4">
                Last Updated: {formatDate(neighborhoodData.lastUpdatedAt)}
              </Text>

              {!isEditMode && (
                <TouchableOpacity
                  onPress={handleEditPress}
                  style={{ backgroundColor: colors.brand.primary }}
                  className="rounded-lg py-3 px-4 flex-row items-center justify-center gap-2"
                  activeOpacity={0.8}
                >
                  <Edit size={18} color="white" />
                  <Text className="text-white text-base font-geist-semibold">
                    Edit Information
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Section Title */}
            <View className="px-6 pt-6 pb-2" style={{ backgroundColor: '#171717' }}>
              <Text className="text-gray-400 text-xs font-geist-medium tracking-widest uppercase">
                ABOUT THE NEIGHBORHOOD
              </Text>
            </View>

            {/* Dynamic Content */}
            {renderContent()}

            {/* Edit Mode Action Buttons */}
            {isEditMode && (
              <View className="px-6 pb-6" style={{ backgroundColor: '#171717' }}>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    className="flex-1 rounded-lg py-3 px-4 border border-gray-600"
                    style={{ backgroundColor: '#1D1D1D' }}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-base font-geist-semibold text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleSubmitEdit}
                    className="flex-1 rounded-lg py-3 px-4"
                    style={{ backgroundColor: colors.brand.primary }}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                  >
                    <Text className="text-white text-base font-geist-semibold text-center">
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
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