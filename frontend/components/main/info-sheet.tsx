import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Pencil, Radio } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MarkerData } from '@/types/neighborhood';
import { formatDate } from '@/utils/formatters';
import {colors} from "@/constants/colors";

interface InfoSheetProps {
  visible: boolean;
  markerData: MarkerData | null;
  onClose: () => void;
  onGetDirections?: (markerData: MarkerData) => void;
  onMoreInfo?: (markerData: MarkerData) => void;
  onEdit?: (markerData: MarkerData) => void;
}

const DetailRow = ({
  label,
  value,
  valueStyle,
  showDivider = true,
}: {
  label: string;
  value: string;
  valueStyle?: string;
  showDivider?: boolean;
}) => (
  <View>
    <View className="flex-row justify-between gap-4 py-3">
      <Text
        className="text-white text-md font-geist-medium flex-shrink-0"
        style={{ width: '35%' }}
      >
        {label}
      </Text>
      <Text
        className={`text-md font-geist-regular flex-1 text-right ${valueStyle || 'text-white'}`}
      >
        {value}
      </Text>
    </View>
    {showDivider && (
      <View style={{ height: 1, backgroundColor: '#404040' }} />
    )}
  </View>
);

export function InfoSheet({
  visible,
  markerData,
  onClose,
  onGetDirections,
  onMoreInfo,
  onEdit,
}: InfoSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Define snap points - single point for fixed height, only closable
  const snapPoints = useMemo(() => ['17%'], []);

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
  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  if (!markerData) return null;
  
  // Debug logging for button visibility
  console.log('🎨 [InfoSheet] Rendering with markerData:', markerData.neighborhoodID);
  console.log('🎨 [InfoSheet] Marker TYPE:', markerData.type);
  console.log('🎨 [InfoSheet] Type check result:', markerData.type === 'own');
  console.log('🎨 [InfoSheet] Will show buttons?', markerData.type === 'own');
  console.log('🎨 [InfoSheet] Full marker object:', JSON.stringify(markerData, null, 2));
  
  // TEMPORARY DEBUG: Show alert with type value
  if (markerData.neighborhoodID === 'N006') {
    console.warn('⚠️ N006 TYPE IS:', markerData.type, '| Expected: "own"');
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      enableOverDrag={false}
      maxDynamicContentSize={400}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      backgroundStyle={{ backgroundColor: 'transparent' }}
    >
      <BottomSheetView className="flex-1">
        <View
          className="flex-1 p-6"
          style={{ 
            backgroundColor: colors.background.primary,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          }}
        >
          {/* Handle bar */}
          <View className="w-12 h-1 bg-white/30 rounded-full self-center mb-6" />

          {/* Content */}
          <View className="gap-2 mb-2">
            {/* Title - Neighborhood ID with Icon */}
            <View className="flex-row items-start gap-3 mb-4">
              <View className="bg-gray-700 rounded-lg p-3">
                <Radio size={22} color={colors.brand.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-geist-semibold">
                  {markerData.neighborhoodID}
                </Text>
                {/* Coordinates moved below neighborhood ID */}
                <Text className="text-gray-400 text-sm font-geist-regular mt-1">
                  {markerData.latitude}, {markerData.longitude}
                </Text>
              </View>

            </View>

            {/* Terminal ID */}
            <DetailRow
              label="Terminal ID"
              value={markerData.terminalID || 'Not assigned'}
            />

            {/* Address */}
            <DetailRow
              label="Terminal Address"
              value={markerData.address || 'No address'}
            />

            {/* Focal Person */}
            {markerData.focalPersonName && (
              <DetailRow
                label="Focal Person"
                value={markerData.focalPersonName}
              />
            )}

            {/* Date Registered - Last item, no divider */}
            <DetailRow
              label="Date Registered"
              value={
                markerData.dateRegistered
                  ? formatDate(markerData.dateRegistered)
                  : 'Unknown'
              }
              showDivider={false}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}