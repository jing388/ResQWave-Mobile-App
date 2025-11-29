import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import React, { RefObject } from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ChangeProfileSheetProps {
  bottomSheetRef: RefObject<BottomSheetModal | null>;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
}

export default function ChangeProfileSheet({ 
  bottomSheetRef, 
  onTakePhoto, 
  onChoosePhoto 
}: ChangeProfileSheetProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['25%']}
      backgroundStyle={{ backgroundColor: '#1F2937' }}
      handleIndicatorStyle={{ backgroundColor: '#6B7280' }}
    >
      <BottomSheetView style={{ padding: 20 }}>
        <Text className="text-gray-50 text-lg font-geist-semibold mb-4">
          Change Profile Picture
        </Text>
        
        <TouchableOpacity
          onPress={onTakePhoto}
          className="flex-row items-center p-4 rounded-xl mb-3 bg-gray-800 border border-gray-600"
          activeOpacity={0.7}
        >
          <Camera size={24} color={colors.tint} />
          <Text className="text-gray-50 text-base font-geist-medium ml-3">
            Take Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onChoosePhoto}
          className="flex-row items-center p-4 rounded-xl bg-gray-800 border border-gray-600"
          activeOpacity={0.7}
        >
          <ImageIcon size={24} color={colors.tint} />
          <Text className="text-gray-50 text-base font-geist-medium ml-3">
            Choose from Gallery
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
