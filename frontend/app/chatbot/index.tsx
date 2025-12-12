import { router } from 'expo-router';
import { Send, Info, SquarePen } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  translation?: string;
}

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi, I'm Reskwie! Think of me like an assistant who's here to help you get to know ResQWave more!\n\nSo, what can I help you with today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [translatingMessages, setTranslatingMessages] = useState<Set<string>>(new Set());
  const [showTranslation, setShowTranslation] = useState<Set<string>>(new Set());

  // Animated values for typing dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  // Load messages from storage on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem('chatbot_messages');
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(messagesWithDates);
          // Scroll to bottom after loading messages
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();
  }, []);

  // Save messages to storage whenever they change
  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem('chatbot_messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    };
    if (messages.length > 0) {
      saveMessages();
    }
  }, [messages]);

  useEffect(() => {
    if (isTyping) {
      const animateDot = (dotOpacity: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dotOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dotOpacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation = Animated.parallel([
        animateDot(dot1Opacity, 0),
        animateDot(dot2Opacity, 200),
        animateDot(dot3Opacity, 400),
      ]);

      animation.start();

      return () => animation.stop();
    } else {
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);
    }
  }, [isTyping]);

  const quickActions = [
    'What is ResQWave for?',
    'How do I edit our neighborhood information?',
    'How to use the ResQWave Terminal?',
  ];
  const handleStopResponse = () => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }
    setIsTyping(false);
  };

  const handleNewChat = async () => {
    // Reset to initial state
    const initialMessages: Message[] = [
      {
        id: '1',
        text: "Hi, I'm Reskwie! Think of me like an assistant who's here to help you get to know ResQWave more!\n\nSo, what can I help you with today?",
        sender: 'bot' as const,
        timestamp: new Date(),
      },
    ];
    setMessages(initialMessages);
    setInputText('');
    setIsTyping(false);
    setTranslatingMessages(new Set());
    setShowTranslation(new Set());
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }
    // Clear storage
    try {
      await AsyncStorage.setItem('chatbot_messages', JSON.stringify(initialMessages));
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

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

      // Scroll to bottom immediately after adding user message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);

      // Show typing indicator
      setIsTyping(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Simulate bot response
      botTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm processing your request. This is a demo response!",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);

        // Scroll to bottom after bot response
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 50);
        botTimeoutRef.current = null;
      }, 1500);
    }
  };

  const handleTranslationToggle = (messageId: string) => {
    if (showTranslation.has(messageId)) {
      // Hide translation
      const newShowTranslation = new Set(showTranslation);
      newShowTranslation.delete(messageId);
      setShowTranslation(newShowTranslation);
    } else {
      // Check if translation exists
      const message = messages.find(m => m.id === messageId);
      if (message?.translation) {
        // Show existing translation
        const newShowTranslation = new Set(showTranslation);
        newShowTranslation.add(messageId);
        setShowTranslation(newShowTranslation);
      } else {
        // Start translating
        const newTranslating = new Set(translatingMessages);
        newTranslating.add(messageId);
        setTranslatingMessages(newTranslating);

        // Simulate translation API call
        setTimeout(() => {
          setMessages(prev => prev.map(m =>
            m.id === messageId
              ? { ...m, translation: 'This is a demo translated text. Translation logic will be added later.' }
              : m
          ));

          const newTranslating = new Set(translatingMessages);
          newTranslating.delete(messageId);
          setTranslatingMessages(newTranslating);

          const newShowTranslation = new Set(showTranslation);
          newShowTranslation.add(messageId);
          setShowTranslation(newShowTranslation);
        }, 1000);
      }
    }
  };

  const handleQuickAction = (action: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: action,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Scroll to bottom immediately after adding user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate bot response
    botTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm processing your request. This is a demo response!",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);

      // Scroll to bottom after bot response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
      botTimeoutRef.current = null;
    }, 1500);
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
          borderRadius: 5,
          backgroundColor: '#161616',
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

      {/* New Chat Button */}
      <TouchableOpacity
        onPress={handleNewChat}
        style={{
          position: 'absolute',
          top: insets.top + 60,
          right: 16,
          zIndex: 20,
          width: 40,
          height: 40,
          borderRadius: 5,
          backgroundColor: '#1D1D1D',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <SquarePen size={20} color="#9CA3AF" />
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
        <View style={{ height: 175, width: '100%', justifyContent: 'flex-end' }}>
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
            backgroundColor: '#161616',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
        >
          {/* Welcome Text */}
          <View style={{ paddingTop: 30, alignItems: 'center', paddingBottom: 20 }}>
            <Text style={{ textAlign: 'center', fontSize: 18 }} className='font-medium'>
              <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>Reskwie</Text>
              <Text style={{ color: '#FFFFFF' }}> at your service!</Text>
            </Text>
            <Text style={{ color: '#A3A3A3', fontSize: 12, textAlign: 'center', marginTop: 4 }} className='font-normal'>
              ResQWave's Chatbot assistant
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
              {messages.map((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const currentTime = message.timestamp.toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });
                const prevTime = prevMessage ? prevMessage.timestamp.toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                }) : null;
                const showTimestamp = currentTime !== prevTime;

                return (
                  <View key={message.id} style={{ marginBottom: 12, alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                    {showTimestamp && (
                      <Text style={{ color: '#6B7280', fontSize: 11, marginBottom: 15, alignSelf: 'center' }}>
                        {message.timestamp.toLocaleString('en-US', {
                          day: '2-digit',
                          month: 'short',
                        }).toUpperCase()} AT {message.timestamp.toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }).toUpperCase()}
                      </Text>
                    )}
                    <View
                      style={{
                        backgroundColor: message.sender === 'user' ? '#3B82F6' : '#1D1D1D',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 6,
                        maxWidth: '85%',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 19 }}>
                        {message.text}
                      </Text>
                      {message.sender === 'bot' && showTranslation.has(message.id) && message.translation && (
                        <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#404040' }}>
                          <Text style={{ color: '#A3A3A3', fontSize: 13, lineHeight: 18 }}>
                            {message.translation}
                          </Text>
                        </View>
                      )}
                    </View>
                    {message.sender === 'bot' && (
                      <TouchableOpacity
                        style={{ marginTop: 4, paddingHorizontal: 4 }}
                        onPress={() => handleTranslationToggle(message.id)}
                      >
                        <Text style={{ color: '#6B7280', fontSize: 11 }}>
                          {translatingMessages.has(message.id)
                            ? 'Translating...'
                            : showTranslation.has(message.id)
                              ? 'Hide translation'
                              : 'See translation'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <View style={{ marginBottom: 12, alignItems: 'flex-start', width: '100%' }}>
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      gap: 4,
                      alignItems: 'center',
                    }}
                  >
                    <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B7280', opacity: dot1Opacity }} />
                    <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B7280', opacity: dot2Opacity }} />
                    <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B7280', opacity: dot3Opacity }} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Quick Actions */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: '#2B2B2B',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 6,
                    marginBottom: 8,
                    alignItems: 'center',
                    opacity: isTyping ? 0.5 : 1,
                  }}
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.7}
                  disabled={isTyping}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 13, lineHeight: 14, textAlign: 'center' }}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input Area */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                paddingBottom: Math.max(insets.bottom, 16),
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 7,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor: '#404040',
                  height: 47,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask anything"
                  placeholderTextColor="#6B7280"
                  style={{ color: '#FFFFFF', fontSize: 14 }}
                  multiline={false}
                  maxLength={500}
                />
              </View>
              <TouchableOpacity
                onPress={isTyping ? handleStopResponse : handleSend}
                style={{
                  width: 47,
                  height: 47,
                  borderRadius: 7,
                  backgroundColor: '#1D1D1D',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (!inputText.trim() && !isTyping) ? 0.5 : 1,
                }}
                activeOpacity={0.8}
                disabled={!inputText.trim() && !isTyping}
              >
                {isTyping ? (
                  <View style={{ width: 16, height: 16, backgroundColor: '#FFFFFF', borderRadius: 2 }} />
                ) : (
                  <Send size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
  );
}
