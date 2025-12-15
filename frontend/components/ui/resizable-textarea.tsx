import { colors } from '@/constants/colors';
import { ChevronDown, ChevronUp, GripVertical, Maximize2, Minimize2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import React, { useState, useRef } from 'react';
import { PanResponder, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ResizableTextAreaProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  error?: string;
  disabled?: boolean;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

export const ResizableTextArea: React.FC<ResizableTextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter information...',
  minHeight = MIN_HEIGHT,
  maxHeight = MAX_HEIGHT,
  className = '',
  error,
  disabled = false,
}) => {
  const [height, setHeight] = useState(minHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: () => {
      setIsResizing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (_, gestureState) => {
      const newHeight = height + gestureState.dy;
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      if (clampedHeight !== height) {
        setHeight(clampedHeight);
      }
    },
    onPanResponderRelease: () => {
      setIsResizing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleExpand = () => {
    const newHeight = Math.min(height + 60, maxHeight);
    setHeight(newHeight);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShrink = () => {
    const newHeight = Math.max(height - 60, minHeight);
    setHeight(newHeight);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleMaximize = () => {
    setHeight(maxHeight);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleMinimize = () => {
    setHeight(minHeight);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const isAtMinHeight = height <= minHeight;
  const isAtMaxHeight = height >= maxHeight;
  const heightPercentage = Math.round((height - minHeight) / (maxHeight - minHeight) * 100);

  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-text-primary text-base font-geist-medium mb-3">
        {label}
      </Text>
      
      <View className="relative">
        {/* Text Input */}
        <View
          className={`bg-card-bg rounded-t-xl border-x border-t ${
            error
              ? 'border-status-error'
              : isFocused
                ? 'border-default-primary'
                : 'border-card-border'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <TextInput
            ref={textInputRef}
            style={{ height: height - 12 }}
            value={value}
            onChangeText={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline
            textAlignVertical="top"
            placeholder={placeholder}
            placeholderTextColor={colors.text.placeholder}
            className="flex-1 text-text-primary text-base font-geist-regular px-4 py-3"
            editable={!disabled}
          />
        </View>

        {/* Resize Handle */}
        <View 
          className={`absolute bottom-0 left-0 right-0 ${
            isResizing ? 'bg-card-border' : 'bg-card-bg'
          } rounded-b-xl border-x border-b ${
            error
              ? 'border-status-error'
              : isFocused
                ? 'border-default-primary'
                : 'border-card-border'
          } ${disabled ? 'opacity-50' : ''}`}
          {...panResponder.panHandlers}
        >
          <View className="px-4 py-3">
            {/* Drag Handle */}
            <View className="flex-row items-center justify-center mb-3">
              <GripVertical 
                size={20} 
                color={isResizing ? colors.text.primary : colors.icon.muted} 
              />
            </View>

            {/* Controls */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleMinimize}
                  disabled={isAtMinHeight || disabled}
                  className={`p-2 rounded-lg ${
                    isAtMinHeight || disabled 
                      ? 'bg-gray-800 opacity-30' 
                      : 'bg-gray-700 opacity-70'
                  }`}
                  activeOpacity={0.7}
                >
                  <Minimize2 size={16} color={colors.icon.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleShrink}
                  disabled={isAtMinHeight || disabled}
                  className={`p-2 rounded-lg ${
                    isAtMinHeight || disabled 
                      ? 'bg-gray-800 opacity-30' 
                      : 'bg-gray-700 opacity-70'
                  }`}
                  activeOpacity={0.7}
                >
                  <ChevronUp size={16} color={colors.icon.secondary} />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-text-muted text-xs font-geist-medium">
                  {heightPercentage}%
                </Text>
                
                <View className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-default-primary rounded-full"
                    style={{ width: `${heightPercentage}%` }}
                  />
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleExpand}
                  disabled={isAtMaxHeight || disabled}
                  className={`p-2 rounded-lg ${
                    isAtMaxHeight || disabled 
                      ? 'bg-gray-800 opacity-30' 
                      : 'bg-gray-700 opacity-70'
                  }`}
                  activeOpacity={0.7}
                >
                  <ChevronDown size={16} color={colors.icon.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleMaximize}
                  disabled={isAtMaxHeight || disabled}
                  className={`p-2 rounded-lg ${
                    isAtMaxHeight || disabled 
                      ? 'bg-gray-800 opacity-30' 
                      : 'bg-gray-700 opacity-70'
                  }`}
                  activeOpacity={0.7}
                >
                  <Maximize2 size={16} color={colors.icon.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <Text className="text-status-error text-xs font-geist-regular mt-2 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
