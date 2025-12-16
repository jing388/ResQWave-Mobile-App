import { colors } from '@/constants/colors';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import React, { useState, useRef } from 'react';
import { PanResponder, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AutosizeTextareaProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  showResizeHandle?: boolean;
}

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 300;

export const AutosizeTextarea: React.FC<AutosizeTextareaProps> = ({
  label,
  value,
  onChangeText,
  placeholder = 'Enter text...',
  error,
  helperText,
  className = '',
  disabled = false,
  minHeight = MIN_HEIGHT,
  maxHeight = MAX_HEIGHT,
  showResizeHandle = true,
}) => {
  const [height, setHeight] = useState(minHeight);
  const [isFocused, setIsFocused] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled && showResizeHandle,
    onMoveShouldSetPanResponder: () => !disabled && showResizeHandle,
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
    const newHeight = Math.min(height + 40, maxHeight);
    setHeight(newHeight);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShrink = () => {
    const newHeight = Math.max(height - 40, minHeight);
    setHeight(newHeight);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const isAtMinHeight = height <= minHeight;
  const isAtMaxHeight = height >= maxHeight;

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-text-primary text-sm font-geist-medium mb-2">
          {label}
        </Text>
      )}
      
      <View className="relative">
        {/* Main Textarea */}
        <View
          className={`bg-card-bg rounded-t-lg border-x border-t ${
            error
              ? 'border-status-error'
              : isFocused
                ? 'border-default-primary'
                : 'border-card-border'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <TextInput
            ref={textInputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.text.placeholder}
            multiline
            textAlignVertical="top"
            style={{
              height: height - (showResizeHandle ? 40 : 8),
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              fontFamily: 'Geist-Regular',
              color: colors.text.primary,
            }}
            onFocus={(e) => {
              setIsFocused(true);
            }}
            onBlur={(e) => {
              setIsFocused(false);
            }}
            editable={!disabled}
          />
        </View>

        {/* Resize Handle */}
        {showResizeHandle && (
          <View 
            className={`bg-card-bg rounded-b-lg border-x border-b ${
              error
                ? 'border-status-error'
                : isFocused
                  ? 'border-default-primary'
                  : 'border-card-border'
            } ${disabled ? 'opacity-50' : ''}`}
            {...panResponder.panHandlers}
          >
            <View className="flex-row items-center justify-between px-3 py-2">
              <View className="flex-row items-center gap-2">
                <GripVertical 
                  size={16} 
                  color={isResizing ? colors.text.primary : colors.icon.muted} 
                />
                <Text className="text-text-muted text-xs font-geist-regular">
                  {height}px
                </Text>
              </View>

              <View className="flex-row items-center gap-1">
                <TouchableOpacity
                  onPress={handleShrink}
                  disabled={isAtMinHeight || disabled}
                  className={`p-1 rounded ${
                    isAtMinHeight || disabled 
                      ? 'opacity-30' 
                      : 'opacity-70'
                  }`}
                  activeOpacity={0.7}
                >
                  <ChevronUp size={14} color={colors.icon.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleExpand}
                  disabled={isAtMaxHeight || disabled}
                  className={`p-1 rounded ${
                    isAtMaxHeight || disabled 
                      ? 'opacity-30' 
                      : 'opacity-70'
                  }`}
                  activeOpacity={0.7}
                >
                  <ChevronDown size={14} color={colors.icon.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {error && (
        <Text className="text-status-error text-xs font-geist-regular mt-1">
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text className="text-text-muted text-xs font-geist-regular mt-1">
          {helperText}
        </Text>
      )}
    </View>
  );
};
