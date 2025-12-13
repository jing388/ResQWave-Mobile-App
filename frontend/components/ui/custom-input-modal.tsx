import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CustomInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder: string;
}

export const CustomInputModal: React.FC<CustomInputModalProps> = ({
  visible,
  onClose,
  onSubmit,
  title,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmit(inputValue.trim());
      setInputValue('');
      onClose();
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <TouchableOpacity activeOpacity={1}>
            <View style={{
              backgroundColor: '#1F2937',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#4B5563',
              padding: 20,
            }}>
              <Text style={{
                color: '#F3F4F6',
                fontSize: 16,
                fontFamily: 'Geist-Medium',
                marginBottom: 12,
                textAlign: 'center',
              }}>
                {title}
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#111827',
                  borderWidth: 1,
                  borderColor: '#4B5563',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  color: '#F3F4F6',
                  fontSize: 16,
                  fontFamily: 'Geist-Regular',
                  marginBottom: 16,
                }}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoFocus
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#6B7280',
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontFamily: 'Geist-Medium',
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#3B82F6',
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: inputValue.trim() ? 1 : 0.5,
                  }}
                  onPress={handleSubmit}
                  activeOpacity={0.7}
                  disabled={!inputValue.trim()}
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontFamily: 'Geist-Medium',
                  }}>
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
