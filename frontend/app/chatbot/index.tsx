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

      {/* Info Button - Fixed to top right of screen */}
      <TouchableOpacity
        onPress={() => {
          console.log('Info pressed');
          // Add your info action here
        }}
        className="absolute z-20 w-10 h-10 rounded-full bg-gray-900 items-center justify-center"
        activeOpacity={0.7}
        style={{
          top: insets.top + 10,
          right: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Info size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Chat Drawer Container */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.85,
          backgroundColor: '#1C1C1E',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          overflow: 'hidden',
        }}
      >

        {/* Header with Avatar */}
        <View
          style={{
            paddingTop: 40,
            alignItems: 'center',
            paddingBottom: 20,
          }}
        >
          {/* Chat Avatar - Add your image here */}
          {/* <Image 
            source={require('@/assets/images/chatbot-mascot.png')} 
            className="w-28 h-28 rounded-full mb-4"
            resizeMode="cover"
          /> */}

          {/* Welcome Text */}
          <View className="bg-gray-900 px-6 py-4 rounded-3xl mx-5 mb-2">
            <Text className="text-center text-base">
              <Text className="text-blue-500 font-bold">Reskwie</Text>
              <Text className="text-white font-normal"> at your service!</Text>
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              ResQWave's Chatbot assistant
            </Text>
          </View>

          {/* Timestamp */}
          <Text className="text-gray-500 text-xs mt-2">
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View key={message.id} className="mb-3">
                <View className="bg-gray-900 px-4 py-3 rounded-2xl">
                  <Text className="text-white text-sm leading-5">
                    {message.text}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <View className="px-5 pb-3">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className="mb-2 px-4 py-3 rounded-lg bg-gray-900"
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-sm">{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Input Area */}
          <View
            className="px-5 py-4"
            style={{
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: '#1C1C1E',
            }}
          >
            <View className="flex-row items-center bg-gray-900 rounded-full px-5 py-1">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask anything"
                placeholderTextColor="#6B7280"
                className="flex-1 text-white text-sm py-3"
                multiline={false}
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSend}
                className="w-11 h-11 rounded-full items-center justify-center ml-2"
                activeOpacity={0.8}
                disabled={!inputText.trim()}
                style={{
                  backgroundColor: inputText.trim() ? '#3B82F6' : '#374151',
                }}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
