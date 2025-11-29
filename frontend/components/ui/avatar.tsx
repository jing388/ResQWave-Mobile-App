import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  className?: string;
  imageSource?: any; // For sample avatar image
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-11 h-11', // 44px (default from your design)
  lg: 'w-14 h-14',
  xl: 'w-32 h-32' // 128px for profile page
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 48
};

const innerSizeClasses = {
  sm: 'w-7 h-7',
  md: 'w-12 h-12', // 36px (inner container)
  lg: 'w-12 h-12',
  xl: 'w-28 h-28' // 112px inner
};

export function Avatar({ 
  size = 'md', 
  onPress,
  className = "",
  imageSource
}: AvatarProps) {
  return (
    <TouchableOpacity 
      className={`${sizeClasses[size]} rounded-xl justify-center items-center ${className}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`${innerSizeClasses[size]} rounded-xl justify-center items-center overflow-hidden bg-blue-500`}>
        {imageSource ? (
          <Image 
            source={imageSource}
            className={`${innerSizeClasses[size]} rounded-xl`}
            resizeMode="cover"
          />
        ) : (
          <IconSymbol 
            name="person.fill" 
            size={iconSizes[size]} 
            color="#FFFFFF" 
          />
        )}
      </View>
    </TouchableOpacity>
  );
}