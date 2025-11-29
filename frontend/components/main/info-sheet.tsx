import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Pencil, Radio } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MarkerData } from '@/types/neighborhood';
import { formatDate } from '@/utils/formatters';

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
}: {
  label: string;
  value: string;
  valueStyle?: string;
}) => (
  <View className="flex-row justify-between gap-4">
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
        <LinearGradient
          colors={['#1F2937', '#171717']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="flex-1 p-6"
        >
          {/* Handle bar */}
          <View className="w-12 h-1 bg-white/30 rounded-full self-center mb-6" />

          {/* Content */}
          <View className="gap-4 mb-2">
            {/* Title - Neighborhood ID */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-gray-700 rounded-lg p-3">
                <Radio size={22} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-geist-semibold">
                  {markerData.neighborhoodID}
                </Text>
                <Text className="text-gray-400 text-sm font-geist-regular mt-1">
                  {markerData.latitude}, {markerData.longitude}
                </Text>
              </View>
              {/* Edit Button */}
              <TouchableOpacity
                className="bg-blue-500 rounded-lg p-3"
                onPress={() => onEdit?.(markerData)}
                activeOpacity={0.7}
              >
                <Pencil size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Terminal ID */}
            <DetailRow
              label="Terminal ID"
              value={markerData.terminalID || 'Not assigned'}
            />

            {/* Address */}
            <DetailRow
              label="Address"
              value={markerData.address || 'No address'}
            />

            {/* Focal Person */}
            {markerData.focalPersonName && (
              <DetailRow
                label="Focal Person"
                value={markerData.focalPersonName}
              />
            )}

            {/* Date Registered */}
            <DetailRow
              label="Date Registered"
              value={
                markerData.dateRegistered
                  ? formatDate(markerData.dateRegistered)
                  : 'Unknown'
              }
            />
          </View>
        </LinearGradient>
      </BottomSheetView>
    </BottomSheet>
  );
}
