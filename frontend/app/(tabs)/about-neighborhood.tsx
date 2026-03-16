import { NeighborhoodEdit } from '@/components/neighborhood/neighborhood-edit';
import { NeighborhoodView } from '@/components/neighborhood/neighborhood-view';
import { FocalPersonModal } from '@/components/neighborhood/focal-person-modal';
import { RefreshNotification } from '@/components/ui/refresh-notification';
import { colors } from '@/constants/colors';
import { useNeighborhoodData } from '@/hooks/use-neighborhood-data';
import { useEditMode } from '@/contexts/edit-mode-context';
import { formatDate } from '@/utils/formatters';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radio, Edit, ArrowLeft, ExternalLink } from 'lucide-react-native';

export default function AboutNeighborhoodScreen() {
  const { setIsEditMode } = useEditMode();
  const [selectedFocalPerson, setSelectedFocalPerson] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    handleAddFamily,
    handleDeleteFamily,
    handleRenameFamilyStart,
    handleRenameFamilyCommit,
    handleToggleFamilyExpand,
    handleAddMember,
    handleDeleteMember,
    handleRenameMemberStart,
    handleRenameMemberCommit,
    isSubmitting,
  } = useNeighborhoodData(null);

  const hasCoordinates =
    Number.isFinite(neighborhoodData?.coordinates?.latitude) &&
    Number.isFinite(neighborhoodData?.coordinates?.longitude);

  const formattedCoordinates = hasCoordinates && neighborhoodData
    ? `${neighborhoodData.coordinates.latitude.toFixed(6)}, ${neighborhoodData.coordinates.longitude.toFixed(6)}`
    : null;

  const handleOpenCoordinates = async () => {
    if (!hasCoordinates || !neighborhoodData) return;

    const mapsUrl = `https://maps.google.com/?q=${neighborhoodData.coordinates.latitude},${neighborhoodData.coordinates.longitude}`;

    Alert.alert(
      'Open in Google Maps?',
      'This will open your neighborhood coordinates in Google Maps.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Maps',
          onPress: async () => {
            const canOpen = await Linking.canOpenURL(mapsUrl);

            if (!canOpen) {
              Alert.alert('Unable to open maps', 'Google Maps could not be opened on this device.');
              return;
            }

            await Linking.openURL(mapsUrl);
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Sync edit mode with global context
  useEffect(() => {
    setIsEditMode(isEditMode);
  }, [isEditMode, setIsEditMode]);

  const handlePrimaryFocalPersonPress = () => {
    if (neighborhoodData?.focalPerson) {
      setSelectedFocalPerson({
        ...neighborhoodData.focalPerson,
        role: 'Main Focal Person',
      });
      setModalVisible(true);
    }
  };

  const handleAlternativeFocalPersonPress = () => {
    if (neighborhoodData?.alternativeFocalPerson) {
      setSelectedFocalPerson({
        ...neighborhoodData.alternativeFocalPerson,
        role: 'Alternative Focal Person',
      });
      setModalVisible(true);
    }
  };

  // Handle cancel with confirmation
  const handleCancelWithConfirmation = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard your changes?',
      [
        {
          text: 'Continue Editing',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: handleCancelEdit,
        },
      ],
      { cancelable: true }
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
      ) : isEditMode ? (
        /* ── EDIT MODE: sticky header + edit form only ── */
        <>
          {/* Sticky header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 14,
              backgroundColor: '#171717',
              borderBottomWidth: 1,
              borderBottomColor: '#2A2A2A',
            }}
          >
            <TouchableOpacity onPress={handleCancelWithConfirmation} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'Geist-SemiBold' }}>
              Neighborhood Info
            </Text>
            <TouchableOpacity
              onPress={handleSubmitEdit}
              disabled={isSubmitting}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text
                style={{
                  color: isSubmitting ? '#6B7280' : colors.brand.primary,
                  fontSize: 16,
                  fontFamily: 'Geist-Bold',
                }}
              >
                {isSubmitting ? 'Saving…' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Edit form */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <NeighborhoodEdit
              neighborhoodData={neighborhoodData}
              editedData={editedData}
              dropdownOptions={dropdownOptions}
              onDropdownChange={handleDropdownChange}
              onHazardToggle={handleHazardToggle}
              onNotableInfoChange={handleNotableInfoChange}
              onAlternativeFocalChange={handleAlternativeFocalChange}
              onAddFamily={handleAddFamily}
              onDeleteFamily={handleDeleteFamily}
              onRenameFamilyStart={handleRenameFamilyStart}
              onRenameFamilyCommit={handleRenameFamilyCommit}
              onToggleFamilyExpand={handleToggleFamilyExpand}
              onAddMember={handleAddMember}
              onDeleteMember={handleDeleteMember}
              onRenameMemberStart={handleRenameMemberStart}
              onRenameMemberCommit={handleRenameMemberCommit}
            />
          </ScrollView>
        </>
      ) : (
        /* ── VIEW MODE (unchanged) ── */
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 0 }}
        >
          {/* Hero Image */}
          <View className="w-full h-48">
            <Image
              source={require('@/assets/images/about-neigh-header-pic.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Name + Edit button */}
          <View className="px-6 pt-6 pb-2" style={{ backgroundColor: '#171717' }}>
            <View className="flex-row items-start gap-3 mb-3">
              <View style={{ backgroundColor: '#1D1D1D' }} className="rounded-lg p-3">
                <Radio size={22} color={colors.brand.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-geist-semibold">
                  {neighborhoodData.name}
                </Text>
                {formattedCoordinates ? (
                  <TouchableOpacity
                    onPress={handleOpenCoordinates}
                    activeOpacity={0.7}
                    style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  >
                    <Text className="text-blue-400 text-sm font-geist-medium">
                      Coordinates: {formattedCoordinates}
                    </Text>
                    <ExternalLink size={12} color="#60A5FA" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            <Text className="text-gray-400 text-sm font-geist-regular mb-4">
              Last Updated: {formatDate(neighborhoodData.lastUpdatedAt)}
            </Text>
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
          </View>

          <NeighborhoodView
            neighborhoodData={neighborhoodData}
            onPrimaryFocalPersonPress={handlePrimaryFocalPersonPress}
            onAlternativeFocalPersonPress={handleAlternativeFocalPersonPress}
          />
        </ScrollView>
      )}

      <RefreshNotification
        visible={notification.visible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onDismiss={dismissNotification}
      />

      {/* Focal Person Modal */}
      <FocalPersonModal
        visible={modalVisible}
        focalPerson={selectedFocalPerson}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
