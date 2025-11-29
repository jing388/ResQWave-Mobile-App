import React from 'react';
import { View } from 'react-native';

interface PinProps {
  type?: 'emergency' | 'safe-zone' | 'default';
  size?: number;
}

export function Pin({ type = 'default', size = 20 }: PinProps) {
  // Determine colors based on type
  const getColors = () => {
    switch (type) {
      case 'emergency':
        return {
          background: '#FF3B30',
        };
      case 'safe-zone':
        return {
          background: '#34D399',
        };
      default:
        return {
          background: '#007AFF',
        };
    }
  };

  const colors = getColors();

  return (
    <View className="items-center justify-center">
      {/* Main pin - simple circle */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.background,
          borderWidth: 2,
          borderColor: 'white',
          // Add shadow for better visibility
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      />
    </View>
  );
}

// Export helper function to get pin colors (used for Circle component)
export function getPinColors(type: 'emergency' | 'safe-zone' | 'default') {
  switch (type) {
    case 'emergency':
      return {
        fill: 'rgba(255, 59, 48, 0.15)',
        stroke: '#FF3B30',
      };
    case 'safe-zone':
      return {
        fill: 'rgba(52, 211, 153, 0.15)',
        stroke: '#34D399',
      };
    default:
      return {
        fill: 'rgba(0, 122, 255, 0.15)',
        stroke: '#007AFF',
      };
  }
}
