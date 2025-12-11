import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface ChatbotButtonProps {
  onPress?: () => void;
  className?: string;
}

export function ChatbotButton({ onPress, className = '' }: ChatbotButtonProps) {
  return (
    <TouchableOpacity
      className={`w-12 h-12 rounded-lg bg-default-black justify-center items-center border border-white/10 ${className}`}
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <MessageCircle size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
