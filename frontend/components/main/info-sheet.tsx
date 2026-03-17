import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { Radio, Share2, Link2, ArrowLeft, Check, ExternalLink } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, Share, Alert, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MarkerData } from '@/types/neighborhood';
import { formatDate } from '@/utils/formatters';
import { colors } from "@/constants/colors";

interface InfoSheetProps {
  visible: boolean;
  markerData: MarkerData | null;
  isOwnNeighborhood?: boolean;
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
        className="text-gray-400 text-sm font-geist-medium flex-shrink-0"
      >
        {label}
      </Text>
      <Text
        className={`text-sm font-geist-regular flex-1 text-right ${valueStyle || 'text-white'}`}
      >
        {value}
      </Text>
    </View>
    {showDivider && (
      <View style={{ height: 1, backgroundColor: '#2A2A2A' }} />
    )}
  </View>
);

export function InfoSheet({
  visible,
  markerData,
  isOwnNeighborhood = false,
  onClose,
  onGetDirections,
  onMoreInfo,
  onEdit,
}: InfoSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 28,
    stiffness: 260,
    mass: 0.75,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
  });

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
        setShowShareSheet(false);
      }
    },
    [onClose],
  );

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
      setShowShareSheet(false);
      setLinkCopied(false);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const generateShareLink = useCallback(() => {
    if (!markerData) return '';
    const baseUrl = 'https://resqwave.app/location';
    return `${baseUrl}?id=${markerData.neighborhoodID}&lat=${markerData.latitude}&lng=${markerData.longitude}`;
  }, [markerData]);

  const handleCopyLink = useCallback(async () => {
    const link = generateShareLink();
    await Clipboard.setStringAsync(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [generateShareLink]);

  const handleNativeShare = useCallback(async () => {
    if (!markerData) return;
    const link = generateShareLink();
    try {
      await Share.share({
        message: `Check out this location: ${markerData.neighborhoodID}\n${markerData.address}\n\n${link}`,
        title: `Share ${markerData.neighborhoodID}`,
      });
    } catch {
      Alert.alert('Error', 'Could not share location');
    }
  }, [markerData, generateShareLink]);

  const handleOpenCoordinates = useCallback(async () => {
    if (!markerData) return;

    const mapsUrl = `https://maps.google.com/?q=${markerData.latitude},${markerData.longitude}`;

    Alert.alert(
      'Open in Google Maps?',
      'This will open the neighborhood coordinates in Google Maps.',
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
  }, [markerData]);

  if (!markerData) return null;

  const signalAccent = isOwnNeighborhood ? '#34D399' : colors.brand.primary;
  const shareAccent = isOwnNeighborhood ? '#10B981' : colors.brand.primary;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      enableDynamicSizing
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      enableOverDrag={false}
      animationConfigs={animationConfigs}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', width: 36, height: 4 }}
      backgroundStyle={{ backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 22,
          paddingTop: 6,
          paddingBottom: 32,
        }}
      >
        {!showShareSheet ? (
          /* Main Info View */
          <>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <View style={{
                backgroundColor: '#2A2A2A',
                borderRadius: 14,
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Radio size={22} color={signalAccent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', letterSpacing: 0.2 }}>
                  {markerData.neighborhoodID}
                </Text>
                <TouchableOpacity
                  onPress={handleOpenCoordinates}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}
                >
                  <Text style={{ color: '#60A5FA', fontSize: 12 }}>
                    {markerData.latitude.toFixed(6)}, {markerData.longitude.toFixed(6)}
                  </Text>
                  <ExternalLink size={12} color="#60A5FA" />
                </TouchableOpacity>
              </View>
              {/* Share Button */}
              <TouchableOpacity
                onPress={() => setShowShareSheet(true)}
                style={{
                  backgroundColor: shareAccent,
                  borderRadius: 12,
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#2A2A2A', marginBottom: 0 }} />

            <DetailRow
              label="Terminal ID"
              value={markerData.terminalID || 'Not assigned'}
            />
            <DetailRow
              label="Terminal Address"
              value={markerData.address || 'No address'}
            />
            <DetailRow
              label="Date Registered"
              value={
                markerData.dateRegistered
                  ? formatDate(markerData.dateRegistered)
                  : 'Unknown'
              }
            />
            <DetailRow
              label="Last Updated At"
              value={
                markerData.lastUpdatedAt
                  ? formatDate(markerData.lastUpdatedAt)
                  : 'Unknown'
              }
              showDivider={false}
            />
          </>
        ) : (
          /* Share Sheet View */
          <>
            {/* Share Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setShowShareSheet(false)}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', flex: 1 }}>
                Share Location
              </Text>
            </View>

            {/* Location Preview */}
            <View style={{
              backgroundColor: '#2A2A2A',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                {markerData.neighborhoodID}
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                {markerData.address || 'No address'}
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 8 }}>
                {markerData.latitude.toFixed(6)}, {markerData.longitude.toFixed(6)}
              </Text>
            </View>

            {/* Share Options */}
            <View style={{ gap: 12 }}>
              {/* Copy Link */}
              <TouchableOpacity
                onPress={handleCopyLink}
                style={{
                  backgroundColor: '#2A2A2A',
                  borderRadius: 14,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View style={{
                  backgroundColor: linkCopied ? '#10B981' : colors.brand.primary,
                  borderRadius: 10,
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {linkCopied ? (
                    <Check size={22} color="#FFFFFF" />
                  ) : (
                    <Link2 size={22} color="#FFFFFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    {linkCopied ? 'Link Copied!' : 'Copy Link'}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>
                    {linkCopied ? 'Link copied to clipboard' : 'Copy sharing link to clipboard'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Share via Native */}
              <TouchableOpacity
                onPress={handleNativeShare}
                style={{
                  backgroundColor: '#2A2A2A',
                  borderRadius: 14,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View style={{
                  backgroundColor: colors.brand.primary,
                  borderRadius: 10,
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Share2 size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    Share via...
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>
                    Share using other apps
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Link Preview */}
            <View style={{
              backgroundColor: '#1A1A1A',
              borderRadius: 12,
              padding: 14,
              marginTop: 20,
              borderWidth: 1,
              borderColor: '#2A2A2A',
            }}>
              <Text style={{ color: '#6B7280', fontSize: 11, marginBottom: 6 }}>
                SHARING LINK
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }} numberOfLines={2}>
                {generateShareLink()}
              </Text>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}