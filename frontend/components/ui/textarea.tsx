import { colors } from '@/constants/colors';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  disabled = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-text-primary text-sm font-geist-medium mb-2">
          {label}
        </Text>
      )}
      
      <View
        className={`bg-card-bg rounded-lg border ${
          error
            ? 'border-status-error'
            : isFocused
              ? 'border-default-primary'
              : 'border-card-border'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <TextInput
          {...props}
          multiline
          textAlignVertical="top"
          style={[
            {
              minHeight: 100,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              fontFamily: 'Geist-Regular',
              color: colors.text.primary,
            },
            style
          ]}
          placeholderTextColor={colors.text.placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          editable={!disabled}
        />
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
