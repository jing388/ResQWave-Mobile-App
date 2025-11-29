import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient-gray' | 'gradient-accent';
  size?: 'sm' | 'md' | 'lg';
  width?: 'auto' | 'full' | 'fit';
  disabled?: boolean;
  className?: string;
}

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  width = 'auto',
  disabled = false,
  className = ''
}: CustomButtonProps) {
  
  // Base button styles
  const getButtonClasses = () => {
    let baseClasses = 'rounded-[5px] items-center justify-center';
    
    // Width variants
    switch (width) {
      case 'full':
        baseClasses += ' w-full';
        break;
      case 'fit':
        baseClasses += ' w-fit';
        break;
      case 'auto':
      default:
        // No width class, uses content width
        break;
    }
    
    // Size variants
    switch (size) {
      case 'sm':
        baseClasses += ' px-4 py-2';
        break;
      case 'md':
        baseClasses += ' px-6 py-3';
        break;
      case 'lg':
        baseClasses += ' px-8 py-4';
        break;
    }
    
    // Color variants
    switch (variant) {
      case 'primary':
        baseClasses += disabled 
          ? ' bg-gray-400' 
          : ' bg-light-primary dark:bg-dark-primary';
        break;
      case 'secondary':
        baseClasses += disabled 
          ? ' bg-gray-300' 
          : ' bg-light-secondary dark:bg-dark-secondary';
        break;
      case 'outline':
        baseClasses += disabled 
          ? ' border-2 border-gray-300 bg-transparent' 
          : ' border-2 border-light-primary dark:border-dark-primary bg-transparent';
        break;
      case 'gradient-gray':
      case 'gradient-accent':
        // No background class needed - handled by LinearGradient
        break;
    }
    
    return `${baseClasses} ${className}`;
  };
  
  const getTextClasses = () => {
    let textClasses = 'font-geist-medium text-center';
    
    // Size-based text
    switch (size) {
      case 'sm':
        textClasses += ' text-sm';
        break;
      case 'md':
        textClasses += ' text-base';
        break;
      case 'lg':
        textClasses += ' text-lg';
        break;
    }
    
    // Color-based text
    switch (variant) {
      case 'primary':
        textClasses += disabled 
          ? ' text-gray-600' 
          : ' text-light-primary-foreground dark:text-dark-primary-foreground';
        break;
      case 'secondary':
        textClasses += disabled 
          ? ' text-gray-600' 
          : ' text-light-secondary-foreground dark:text-dark-secondary-foreground';
        break;
      case 'outline':
        textClasses += disabled 
          ? ' text-gray-400' 
          : ' text-light-primary dark:text-dark-primary';
        break;
      case 'gradient-gray':
        textClasses += disabled 
          ? ' text-gray-600' 
          : ' text-white';
        break;
      case 'gradient-accent':
        textClasses += disabled 
          ? ' text-gray-600' 
          : ' text-white';
        break;
    }
    
    return textClasses;
  };
  
  // Simple gradient check and colors
  const isGradient = variant === 'gradient-gray' || variant === 'gradient-accent';
  
  const gradientColors: [string, string] | null = 
    variant === 'gradient-gray' 
      ? (disabled ? ['#9CA3AF', '#6B7280'] : ['#868686', '#5B5B5B'])
    : variant === 'gradient-accent' 
      ? (disabled ? ['#9CA3AF', '#6B7280'] : ['#70A6FF', '#3B82F6'])
    : null;

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {isGradient && gradientColors && (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 5,
          }}
        />
      )}
      <Text className={getTextClasses()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}