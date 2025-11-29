import { colors } from '@/constants/colors';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

interface CustomInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: LucideIcon;
  isPassword?: boolean;
  error?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  placeholder,
  icon: Icon,
  isPassword = false,
  error,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="relative">
      <View
        className={`flex-row items-center bg-card-bg rounded-xl border h-16 px-4 ${
          error
            ? 'border-status-error'
            : isFocused
              ? 'border-default-primary'
              : 'border-card-border'
        }`}
      >
        {Icon && (
          <Icon
            size={20}
            color={colors.icon.muted}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          secureTextEntry={isPassword && !showPassword}
          className="flex-1 text-text-primary text-base h-full font-geist-regular py-0"
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="p-2"
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.icon.secondary} />
            ) : (
              <Eye size={20} color={colors.icon.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-status-error text-xs font-geist-regular mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
