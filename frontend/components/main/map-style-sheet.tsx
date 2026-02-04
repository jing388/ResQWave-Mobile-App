import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Map, Satellite } from 'lucide-react-native';
import React, { RefObject, useCallback } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

export interface MapStyle {
  id: string;
  name: string;
  urlTemplate: string;
  description?: string;
  icon?: (color: string) => React.ReactNode;
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: 'default',
    name: 'Default',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    description: 'Standard street map view',
    icon: (color) => <Map size={24} color={color} />
  },
  {
    id: 'satellite',
    name: 'Satellite',
    urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    description: 'Satellite imagery view',
    icon: (color) => <Satellite size={24} color={color} />
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
      snapPoints={['30%']}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      onDismiss={handleDismiss}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View
          className="flex-1 p-6"
          style={{
            backgroundColor: colors.background.primary,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          }}
        >
          {/* Handle bar */}
          <View className="w-12 h-1 bg-white/30 rounded-full self-center mb-4" />

          <Text className="text-white text-lg font-geist-semibold mb-4">
            Map Style
          </Text>
          
          <View className="flex-row gap-3">
            {MAP_STYLES.map((style) => {
              const isSelected = currentStyleId === style.id;
              
              return (
                <TouchableOpacity
                  key={style.id}
                  onPress={() => handleStyleSelect(style)}
                  className={`flex-1 flex-col items-center justify-center p-4 rounded-xl ${
                    isSelected ? 'bg-blue-500/20 border-2 border-blue-500' : 'border border-gray-700'
                  }`}
                  activeOpacity={0.7}
                  style={{ minHeight: 100 }}
                >
                  <View className="mb-2">
                    {style.icon?.(isSelected ? '#3B82F6' : '#FFFFFF')}
                  </View>
                  <Text className={`text-center text-sm font-geist-medium ${
                    isSelected ? 'text-blue-400' : 'text-gray-300'
                  }`}>
                    {style.name}
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
