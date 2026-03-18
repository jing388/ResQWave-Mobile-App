import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MapPin, Share2 } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Share, Platform, Alert } from 'react-native';
import { colors } from "@/constants/colors";
import { reverseGeocode } from '@/services/geocoding-service';
import { buildGoogleMapsLink } from '@/utils/map-links';

interface CurrentLocationSheetProps {
  visible: boolean;
  latitude: number | null;
  longitude: number | null;
  onClose: () => void;
}

export function CurrentLocationSheet({
  visible,
  latitude,
  longitude,
  onClose,
}: CurrentLocationSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [placeName, setPlaceName] = useState<string>('Loading...');
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);

  // Define snap points
  const snapPoints = useMemo(() => ['25%'], []);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // Control sheet visibility
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  // Fetch place name when location changes
  useEffect(() => {
    if (visible && latitude !== null && longitude !== null) {
      setIsLoadingPlace(true);
      reverseGeocode(latitude, longitude)
        .then((result) => {
          setPlaceName(result.placeName);
        })
        .catch((error) => {
          console.error('Failed to get place name:', error);
          setPlaceName('Unknown Location');
        })
        .finally(() => {
          setIsLoadingPlace(false);
        });
    }
  }, [visible, latitude, longitude]);

  // Handle share location
  const handleShareLocation = useCallback(async () => {
    if (latitude === null || longitude === null) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      const googleMapsUrl = buildGoogleMapsLink(latitude, longitude);
      const message = `My Current Location: ${placeName}\n${googleMapsUrl}`;

      const result = await Share.share({
        message,
        url: Platform.OS === 'ios' ? googleMapsUrl : undefined,
        title: 'Share My Location',
      });

      if (result.action === Share.sharedAction) {
        console.log('Location shared successfully');
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      Alert.alert('Error', 'Failed to share location');
    }
  }, [latitude, longitude, placeName]);

  if (latitude === null || longitude === null) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      enableOverDrag={false}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      backgroundStyle={{ backgroundColor: 'transparent' }}
    >
      <BottomSheetView className="flex-1">
        <View
          className="flex-1 px-6 py-5"
          style={{
            backgroundColor: colors.background.primary,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          }}
        >
          {/* Handle bar */}
          <View className="w-12 h-1 bg-white/30 rounded-full self-center mb-5" />

          {/* Content */}
          <View className="gap-3 flex-1">
            {/* Title with Icon */}
            <View className="flex-row items-start gap-3 mb-2">
              <View className="bg-blue-500/20 rounded-lg p-3">
                <MapPin size={22} color="#3B82F6" fill="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-geist-semibold">
                  Your Location
                </Text>
                <Text className="text-gray-400 text-sm font-geist-regular mt-1">
                  {isLoadingPlace ? 'Loading...' : placeName}
                </Text>
              </View>
            </View>

            {/* Coordinates */}
            <View className="bg-gray-800/50 rounded-lg p-3 mt-2">
              <Text className="text-gray-300 text-sm font-geist-regular">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleShareLocation}
              activeOpacity={0.7}
              style={{ backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, marginTop: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={20} color="white" style={{ marginRight: 10 }} />
                <Text className="text-white text-base font-geist-semibold">Share Location</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
