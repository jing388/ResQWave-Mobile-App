import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Map, MapPin, Satellite, Bus, Car, Bike, Box, Eye, Flame, Wind } from 'lucide-react-native';
import React, { RefObject, useCallback } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface MapStyle {
  id: string;
  name: string;
  urlTemplate: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface MapDetail {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: 'default',
    name: 'Default',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    description: 'Standard street map view',
    icon: <Map size={24} color="#34D399" />
  },
  {
    id: 'satellite',
    name: 'Satellite',
    urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    description: 'Satellite imagery view',
    icon: <Satellite size={24} color="#3B82F6" />
  },
  {
    id: 'terrain',
    name: 'Terrain',
    urlTemplate: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    description: 'Topographic terrain view',
    icon: <MapPin size={24} color="#F59E0B" />
  }
];

export const MAP_DETAILS: MapDetail[] = [
  {
    id: 'public-transport',
    name: 'Public Transport',
    icon: <Bus size={20} color="#8B5CF6" />
  },
  {
    id: 'traffic',
    name: 'Traffic',
    icon: <Car size={20} color="#EF4444" />
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: <Bike size={20} color="#10B981" />
  },
  {
    id: '3d',
    name: '3D',
    icon: <Box size={20} color="#F59E0B" />
  },
  {
    id: 'street-view',
    name: 'Street View',
    icon: <Eye size={20} color="#3B82F6" />
  },
  {
    id: 'wildfires',
    name: 'Wildfires',
    icon: <Flame size={20} color="#DC2626" />
  },
  {
    id: 'air-quality',
    name: 'Air Quality',
    icon: <Wind size={20} color="#06B6D4" />
  }
];

interface MapStyleSheetProps {
  bottomSheetRef: RefObject<BottomSheetModal | null>;
  onStyleSelect: (style: MapStyle) => void;
  currentStyleId: string;
  onMapDetailToggle?: (detailId: string, enabled: boolean) => void;
  enabledMapDetails?: Set<string>;
}

export default function MapStyleSheet({ 
  bottomSheetRef, 
  onStyleSelect, 
  currentStyleId,
  onMapDetailToggle,
  enabledMapDetails = new Set()
}: MapStyleSheetProps) {

  const handleStyleSelect = useCallback((style: MapStyle) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStyleSelect(style);
    bottomSheetRef.current?.close();
  }, [onStyleSelect, bottomSheetRef]);

  const handleMapDetailToggle = useCallback((detailId: string) => {
    const isEnabled = enabledMapDetails.has(detailId);
    const newEnabledState = !isEnabled;
    
    Haptics.notificationAsync(
      newEnabledState 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Warning
    );
    
    onMapDetailToggle?.(detailId, newEnabledState);
  }, [enabledMapDetails, onMapDetailToggle]);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['60%']}
      backgroundStyle={{ backgroundColor: '#1F2937' }}
      handleIndicatorStyle={{ backgroundColor: '#6B7280' }}
      onDismiss={handleDismiss}
    >
      <BottomSheetView style={{ padding: 20 }}>
        <Text className="text-gray-50 text-lg font-geist-semibold mb-4">
          Map Style
        </Text>
        
        <View className="flex-row flex-wrap justify-between mb-6">
          {MAP_STYLES.map((style) => {
            const isSelected = currentStyleId === style.id;
            
            return (
              <TouchableOpacity
                key={style.id}
                onPress={() => handleStyleSelect(style)}
                className={`w-[30%] flex-col items-center justify-center p-3 rounded-xl mb-3 bg-gray-800 border border-gray-600 ${
                  isSelected ? 'bg-blue-900/30 border-blue-500' : ''
                }`}
                activeOpacity={0.7}
                style={{ minHeight: 90 }}
              >
                <View className="mb-2">
                  {style.icon}
                </View>
                <Text className={`text-center text-sm font-geist-medium ${
                  isSelected ? 'text-blue-400' : 'text-gray-50'
                }`}>
                  {style.name}
                  {isSelected && ' ✓'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="border-t border-gray-700 pt-4">
          <Text className="text-gray-50 text-lg font-geist-semibold mb-4">
            Map Details
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {MAP_DETAILS.map((detail) => {
              const isEnabled = enabledMapDetails.has(detail.id);
              
              return (
                <TouchableOpacity
                  key={detail.id}
                  onPress={() => handleMapDetailToggle(detail.id)}
                  className={`w-[30%] flex-col items-center justify-center p-3 rounded-xl mb-3 border ${
                    isEnabled 
                      ? 'bg-blue-900/30 border-blue-500' 
                      : 'bg-gray-800 border-gray-600'
                  }`}
                  activeOpacity={0.7}
                  style={{ minHeight: 80 }}
                >
                  <View className="mb-2">
                    {detail.icon}
                  </View>
                  <Text className={`text-center text-sm font-geist-medium ${
                    isEnabled ? 'text-blue-400' : 'text-gray-50'
                  }`}>
                    {detail.name}
                    {isEnabled && ' ✓'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
