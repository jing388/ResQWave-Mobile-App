import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CustomInputModal } from './custom-input-modal';

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
  showCustomInput?: boolean;
  onCustomValue?: (value: string) => void;
}

export function Dropdown({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select option',
  disabled = false,
  width = 'full',
  showCustomInput = false,
  onCustomValue,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const hasSelection = !!selectedOption;

  const handleSelect = (value: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (value === 'custom' && showCustomInput && onCustomValue) {
      setShowCustomModal(true);
      setIsOpen(false);
    } else {
      onValueChange(value);
      setIsOpen(false);
    }
  };

  const handleCustomSubmit = (customValue: string) => {
    if (onCustomValue) {
      onCustomValue(customValue);
    }
  };

  const handleOpen = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsOpen(true);
    }
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
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 12,
            borderWidth: 1,
            height: 56,
            paddingHorizontal: 16,
          },
          disabled 
            ? {
                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                borderColor: '#374151',
                opacity: 0.5,
              }
            : hasSelection 
              ? {
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                }
              : {
                  backgroundColor: '#1F2937',
                  borderColor: '#4B5563',
                }
        ]}
        onPress={handleOpen}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[
          {
            fontSize: 16,
            fontFamily: 'Geist-Medium',
            flex: 1,
            marginRight: 8,
          },
          { color: hasSelection ? '#FFFFFF' : '#9CA3AF' }
        ]} numberOfLines={1}>
          {displayText}
        </Text>
        <View style={[
          { marginLeft: 8 },
          isOpen ? { transform: [{ rotate: '180deg' }] } : {}
        ]}>
          <ChevronDown 
            size={20} 
            color={hasSelection ? "#3B82F6" : "#9CA3AF"} 
          />
        </View>
        {hasSelection && (
          <View style={{ marginLeft: 8, width: 8, height: 8, backgroundColor: '#60A5FA', borderRadius: 4 }} />
        )}
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
            <TouchableOpacity activeOpacity={1}>
              <View style={[
                {
                  backgroundColor: '#1F2937',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#4B5563',
                  maxHeight: 384,
                  overflow: 'hidden',
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 25 },
                  shadowOpacity: 0.5,
                  shadowRadius: 25,
                }
              ]}>
                {/* Modal Header */}
                <View style={{
                  backgroundColor: '#1F2937',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#4B5563',
                }}>
                  <Text style={{
                    color: '#D1D5DB',
                    fontSize: 14,
                    fontFamily: 'Geist-Medium',
                    textAlign: 'center',
                  }}>
                    Select an option
                  </Text>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  {options.map((option, index) => {
                    const isFirst = index === 0;
                    const isLast = index === options.length - 1;
                    const isSelected = option.value === selectedValue;
                    
                    let borderStyle = {};
                    if (isFirst && isLast) {
                      borderStyle = { borderRadius: 12 };
                    } else if (isFirst) {
                      borderStyle = { borderTopLeftRadius: 12, borderTopRightRadius: 12 };
                    } else if (isLast) {
                      borderStyle = { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 };
                    }
                    
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          {
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                          },
                          borderStyle,
                          !isLast ? { borderBottomWidth: 1, borderBottomColor: '#374151' } : {},
                          isSelected ? { backgroundColor: 'rgba(59, 130, 246, 0.2)' } : { backgroundColor: '#1F2937' }
                        ]}
                        onPress={() => handleSelect(option.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          {
                            fontSize: 16,
                            fontFamily: 'Geist-Medium',
                          },
                          isSelected ? { color: '#60A5FA' } : { color: '#F3F4F6' }
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <View style={{ 
                            position: 'absolute', 
                            right: 16, 
                            top: '50%', 
                            transform: [{ translateY: -4 }] 
                          }}>
                            <View style={{ width: 8, height: 8, backgroundColor: '#60A5FA', borderRadius: 4 }} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Input Modal */}
      <CustomInputModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSubmit={handleCustomSubmit}
        title="Enter Custom Number"
        placeholder="Enter number"
      />
    </View>
  );
}
