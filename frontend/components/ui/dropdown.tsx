import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: 'full' | 'half' | number;
}

export function Dropdown({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select option',
  disabled = false,
  width = 'full'
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  const getWidthStyle = () => {
    if (width === 'full') return { flex: 1 };
    if (width === 'half') return { flex: 0.5 };
    if (typeof width === 'number') return { width };
    return { flex: 1 };
  };

  return (
    <View style={getWidthStyle()}>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        className={`flex-row items-center justify-between bg-gray-800 rounded-xl border border-gray-600 h-12 px-4 ${
          disabled ? 'opacity-50' : ''
        }`}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text className={`text-base font-geist-regular ${
          selectedOption ? 'text-gray-50' : 'text-gray-400'
        }`}>
          {displayText}
        </Text>
        <ChevronDown 
          size={20} 
          color="#9CA3AF" 
          style={{ 
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }] 
          }} 
        />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 justify-center px-6">
            <TouchableOpacity activeOpacity={1}>
              <View className="bg-gray-800 rounded-xl border border-gray-600 max-h-80" style={{ overflow: 'hidden' }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {options.map((option, index) => {
                    const isFirst = index === 0;
                    const isLast = index === options.length - 1;
                    
                    let borderClass = '';
                    if (isFirst && isLast) {
                      // Single item - all corners rounded
                      borderClass = 'rounded-xl';
                    } else if (isFirst) {
                      // First item - top corners rounded
                      borderClass = 'rounded-t-lg';
                    } else if (isLast) {
                      // Last item - bottom corners rounded
                      borderClass = 'rounded-b-lg';
                    }
                    
                    return (
                      <TouchableOpacity
                        key={option.value}
                        className={`px-4 py-4 ${borderClass} ${
                          !isLast ? 'border-b border-gray-600' : ''
                        } ${
                          option.value === selectedValue ? 'bg-gray-700' : ''
                        }`}
                        onPress={() => handleSelect(option.value)}
                      >
                        <Text className={`text-base font-geist-regular ${
                          option.value === selectedValue ? 'text-blue-400' : 'text-gray-50'
                        }`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
