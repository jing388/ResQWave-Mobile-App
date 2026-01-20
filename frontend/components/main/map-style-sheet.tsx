import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Map, MapPin, Satellite } from 'lucide-react-native';
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

interface MapStyleSheetProps {
  bottomSheetRef: RefObject<BottomSheetModal | null>;
  onStyleSelect: (style: MapStyle) => void;
  currentStyleId: string;
}

export default function MapStyleSheet({ 
  bottomSheetRef, 
  onStyleSelect, 
  currentStyleId
}: MapStyleSheetProps) {

  const handleStyleSelect = useCallback((style: MapStyle) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStyleSelect(style);
    bottomSheetRef.current?.close();
  }, [onStyleSelect, bottomSheetRef]);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['35%']}
      backgroundStyle={{ backgroundColor: '#1F2937' }}
      handleIndicatorStyle={{ backgroundColor: '#6B7280' }}
      onDismiss={handleDismiss}
    >
      <BottomSheetView style={{ padding: 20 }}>
        <Text className="text-gray-50 text-lg font-geist-semibold mb-4">
          Map Style
        </Text>
        
        <View className="flex-row flex-wrap justify-between">
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
      </BottomSheetView>
    </BottomSheetModal>
  );
}
