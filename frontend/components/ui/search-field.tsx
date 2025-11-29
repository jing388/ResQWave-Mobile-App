import { Search } from 'lucide-react-native';
import React from 'react';
import { TextInput, View } from 'react-native';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search...',
}: SearchFieldProps) {
  return (
    <View className="relative">
      <View className="flex-row items-center bg-gray-800 rounded-xl border border-gray-600 h-12 px-4">
        <Search size={20} color="#9CA3AF" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          className="flex-1 text-gray-50 text-base h-full ml-3 font-geist-regular py-0"
        />
      </View>
    </View>
  );
}
