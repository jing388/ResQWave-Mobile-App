import React from 'react';
import { Text, View } from 'react-native';

interface EditInfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const EditInfoCard: React.FC<EditInfoCardProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <View
      className={`bg-gray-800/50 rounded-xl p-6 mb-4 border border-gray-700 ${className}`}
    >
      <Text className="text-text-muted text-sm font-geist-medium spacing-10 tracking-wide mb-4">
        {title}
      </Text>
      {children}
    </View>
  );
};
