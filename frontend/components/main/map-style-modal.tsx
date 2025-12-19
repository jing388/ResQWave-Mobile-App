import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface MapStyle {
  id: string;
  name: string;
  urlTemplate: string;
  description?: string;
}

interface MapStyleModalProps {
  visible: boolean;
  onClose: () => void;
  onStyleSelect: (style: MapStyle) => void;
  currentStyleId: string;
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: 'default',
    name: 'Default',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    description: 'Standard street map view'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    description: 'Satellite imagery view'
  },
  {
    id: 'terrain',
    name: 'Terrain',
    urlTemplate: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    description: 'Topographic terrain view'
  }
];

export const MapStyleModal: React.FC<MapStyleModalProps> = ({
  visible,
  onClose,
  onStyleSelect,
  currentStyleId,
}) => {
  const handleStyleSelect = (style: MapStyle) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStyleSelect(style);
    onClose();
  };

  const handleBackdropPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <TouchableOpacity activeOpacity={1}>
            <View style={{
              backgroundColor: '#1F2937',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#4B5563',
              padding: 20,
            }}>
              <Text style={{
                color: '#F3F4F6',
                fontSize: 18,
                fontFamily: 'Geist-Medium',
                marginBottom: 16,
                textAlign: 'center',
              }}>
                Map Style
              </Text>
              
              {MAP_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={{
                    backgroundColor: currentStyleId === style.id ? '#3B82F6' : '#111827',
                    borderWidth: 1,
                    borderColor: currentStyleId === style.id ? '#60A5FA' : '#4B5563',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                  }}
                  onPress={() => handleStyleSelect(style)}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: '#F3F4F6',
                    fontSize: 16,
                    fontFamily: 'Geist-Medium',
                    marginBottom: 4,
                  }}>
                    {style.name}
                    {currentStyleId === style.id && ' ✓'}
                  </Text>
                  <Text style={{
                    color: '#9CA3AF',
                    fontSize: 14,
                    fontFamily: 'Geist-Regular',
                  }}>
                    {style.description}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={{
                  backgroundColor: '#6B7280',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 8,
                }}
                onPress={handleBackdropPress}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontFamily: 'Geist-Medium',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
