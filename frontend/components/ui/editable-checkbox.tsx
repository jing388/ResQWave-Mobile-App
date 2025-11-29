import { Check } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EditableCheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export const EditableCheckbox: React.FC<EditableCheckboxProps> = ({
  label,
  checked,
  onToggle,
}) => (
  <TouchableOpacity
    className="flex-row items-center py-2 mb-1"
    onPress={onToggle}
    activeOpacity={1}
  >
    <View
      className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
        checked ? 'bg-blue-500 border-blue-500' : 'border-gray-600 bg-gray-800'
      }`}
    >
      {checked && <Check size={12} color="#ffffff" />}
    </View>
    <Text className="text-white text-md font-geist-light flex-1 leading-5">
      {label}
    </Text>
  </TouchableOpacity>
);
