import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Map, Satellite } from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
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
  visible: boolean;
  onClose: () => void;
  onStyleSelect: (style: MapStyle) => void;
  currentStyleId: string;
  onSheetChange?: (index: number) => void;
}

export default function MapStyleSheet({
  visible,
  onClose,
  onStyleSelect,
  currentStyleId,
  onSheetChange,
}: MapStyleSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleStyleSelect = useCallback(
    (style: MapStyle) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onStyleSelect(style);
      bottomSheetRef.current?.close();
    },
    [onStyleSelect]
  );

  const handleSheetChange = useCallback(
    (index: number) => {
      // When the sheet is closed, notify the parent so it can update state.
      if (index === -1) {
        onClose();
      }
      onSheetChange?.(index);
    },
    [onClose, onSheetChange]
  );

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      enableDynamicSizing
      enablePanDownToClose
      enableHandlePanningGesture
      enableOverDrag={false}
      onChange={handleSheetChange}
      onDismiss={handleDismiss}
      backgroundStyle={{
        backgroundColor: 'transparent',
      }}
      handleIndicatorStyle={{
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
      }}
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
          <View className="self-center mb-4 py-2">
            <View className="w-14 h-1.5 bg-white/30 rounded-full" />
          </View>

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
    </BottomSheet>
  );
}
