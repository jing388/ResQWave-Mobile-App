import { router } from 'expo-router';
import { Send, Info } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi, I'm Reskwie! Think of me like an assistant who's here to help you get to know ResQWave more!",
      sender: 'bot',
      timestamp: new Date(),
    },
    {
      id: '2',
      text: 'So, what can I help you with today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const quickActions = [
    'What is ResQWave for?',
    'How do I edit our neighborhood information?',
    'How to use the ResQWave Terminal?',
  ];

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText('');

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm processing your request. This is a demo response!",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputText(action);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Dimmed Background - Tap to close */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      {/* Info Button */}
      <TouchableOpacity
        onPress={() => {
          console.log('Info pressed');
        }}
        style={{
          position: 'absolute',
          top: insets.top + 10,
          right: 16,
          zIndex: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#1F2937',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Info size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Sheet Container */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#3B82F6",
          flexDirection: 'column',
        }}
      >
        {/* Container 1: Mascot */}
        <View style={{ height: 190, width: '100%', justifyContent: 'flex-end' }}>
          <Image
            source={require('@/assets/images/ChatbotMascot.png')}
            style={{ width: '100%', height: '90%' }}
            resizeMode="cover"
          />
        </View>

        {/* Container 2: Chat Drawer */}
        <View
          style={{
            flex: 1,
            backgroundColor: '#1C1C1E',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
        >
          {/* Welcome Text */}
          <View style={{ paddingTop: 30, alignItems: 'center', paddingBottom: 20 }}>
            <View
              style={{
                backgroundColor: '#2C2C2E',
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderRadius: 24,
                marginHorizontal: 20,
                marginBottom: 8,
              }}
            >
              <Text style={{ textAlign: 'center', fontSize: 16 }}>
                <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>Reskwie</Text>
                <Text style={{ color: '#FFFFFF' }}> at your service!</Text>
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                ResQWave's Chatbot assistant
              </Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 8 }}>
              {new Date().toLocaleString('en-US', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }).toUpperCase()}
            </Text>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1, paddingHorizontal: 20 }}
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <View key={message.id} style={{ marginBottom: 12 }}>
                  <View
                    style={{
                      backgroundColor: '#2C2C2E',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 16,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20 }}>
                      {message.text}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      backgroundColor: '#2C2C2E',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                    onPress={() => handleQuickAction(action)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 14 }}>{action}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Input Area */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                paddingBottom: Math.max(insets.bottom, 16),
                backgroundColor: '#1C1C1E',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#2C2C2E',
                  borderRadius: 25,
                  paddingHorizontal: 20,
                  paddingVertical: 4,
                }}
              >
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask anything"
                  placeholderTextColor="#6B7280"
                  style={{ flex: 1, color: '#FFFFFF', fontSize: 14, paddingVertical: 12 }}
                  multiline={false}
                  maxLength={500}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: inputText.trim() ? '#3B82F6' : '#374151',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 8,
                  }}
                  activeOpacity={0.8}
                  disabled={!inputText.trim()}
                >
                  <Send size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
  );
}
