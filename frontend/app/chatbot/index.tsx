import { router } from 'expo-router';
import { Send, Info, SquarePen, ArrowLeft } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/lib/api-client';
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

  const [messages, setMessages] = useState<Message[]>([]);
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
          setGreetingShown(true);
          // Scroll to bottom after loading messages
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 100);
        } else {
          // No saved messages, show initial greeting
          setIsTyping(true);
          setGreetingShown(false);

          const greetingText =
            "Hi, I'm Reskwie! Think of me like an assistant who's here to help you get to know ResQWave more!\n\nSo, what can I help you with today?";

          // Fetch quick actions from backend
          (async () => {
            try {
              const data = await apiFetch<{ quickActions?: string[] }>('/chatbot/chat', {
                method: 'POST',
                body: JSON.stringify({ text: 'Generate quick actions for greeting', mode: 'quickActions', userRole }),
              });
              if (Array.isArray(data.quickActions) && data.quickActions.length) {
                setQuickActions(data.quickActions.slice(0, 3));
              }
            } catch (_err) {
              // Silently fallback to default quick actions
              setQuickActions([
                'What is ResQWave for?',
                'How do I send an SOS alert?',
                'How to use the terminal?',
              ]);
            }
          })();

          setTimeout(() => {
            const greetingMessage: Message = {
              id: '1',
              text: greetingText,
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages([greetingMessage]);
            setIsTyping(false);
            setGreetingShown(true);
          }, 1000);
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

  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [greetingShown, setGreetingShown] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string>(
    "Hi, I'm Reskwie! Think of me like an assistant who's here to help you get to know ResQWave more!\n\nSo, what can I help you with today?"
  );
  const [userRole] = useState<string>('focal_persons');

  // Fetch welcome message from backend on mount
  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      try {
        const data = await apiFetch<{ settings?: { welcomeMessage?: string } }>('/chatbot/settings', {
          method: 'GET',
        });
        if (data.settings?.welcomeMessage) {
          setWelcomeMessage(data.settings.welcomeMessage);
        }
      } catch (error) {
        console.error('Error fetching welcome message:', error);
        // Keep default if fetch fails
      }
    };
    fetchWelcomeMessage();
  }, []);

  // Auto-scroll when quick actions appear
  useEffect(() => {
    if (quickActions.length > 0 && greetingShown) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [quickActions, greetingShown]);

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
        text: welcomeMessage,
        sender: 'bot' as const,
        timestamp: new Date(),
      },
    ];
    setMessages(initialMessages);
    setInputText('');
    setIsTyping(false);
    setTranslatingMessages(new Set());
    setShowTranslation(new Set());
    setQuickActions([]);
    setGreetingShown(true);
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

    // Fetch new quick actions
    try {
      const data = await apiFetch<{ quickActions?: string[] }>('/chatbot/chat', {
        method: 'POST',
        body: JSON.stringify({ text: 'Generate quick actions for greeting', mode: 'quickActions', userRole }),
      });
      if (Array.isArray(data.quickActions) && data.quickActions.length) {
        setQuickActions(data.quickActions.slice(0, 3));
      }
    } catch (_err) {
      // Silently fallback to default quick actions
      setQuickActions([
        'What is ResQWave for?',
        'How do I send an SOS alert?',
        'How to use the terminal?',
      ]);
    }
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      const textToSend = inputText;
      const newMessage: Message = {
        id: Date.now().toString(),
        text: textToSend,
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

      // Hide quick actions immediately
      setQuickActions([]);

      try {
        // Call backend API for chatbot response
        const data = await apiFetch<{ response?: string }>('/chatbot/chat', {
          method: 'POST',
          body: JSON.stringify({ text: textToSend, mode: 'main', userRole }),
        });
        const aiResponse = data?.response || '[No response]';

        setIsTyping(false);
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);

        // Scroll to bottom after bot response
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Fetch quick actions (fire-and-forget)
        (async () => {
          try {
            const qaData = await apiFetch<{ quickActions?: string[] }>('/chatbot/chat', {
              method: 'POST',
              body: JSON.stringify({ text: textToSend, mode: 'quickActions', userRole }),
            });
            if (Array.isArray(qaData.quickActions) && qaData.quickActions.length > 0) {
              setQuickActions(qaData.quickActions.slice(0, 3));
              // Scroll again after quick actions load
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 250);
            } else {
              // Fallback if empty array returned
              setQuickActions([
                'How do I send an SOS alert?',
                'What do the LED indicators mean?',
                'How to use the terminal?',
              ]);
            }
          } catch (err) {
            // Silently fallback to default quick actions
            setQuickActions([
              'How do I send an SOS alert?',
              'What do the LED indicators mean?',
              'How to use the terminal?',
            ]);
          }
        })();
      } catch (error) {
        console.error('Error calling backend chatbot:', error);
        setIsTyping(false);
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I apologize, but I'm having trouble connecting right now. ResQWave is a LoRa-powered emergency communication system that helps communities during floods. Please try asking your question again, or contact our support team at resqwaveinfo@gmail.com for immediate assistance.",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);

        // Show fallback quick actions
        setQuickActions([
          'What is ResQWave for?',
          'How do I send an SOS alert?',
          'How to use the terminal?',
        ]);

        // Scroll to bottom after error response and quick actions
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 250);
      }
    }
  };

  const handleTranslationToggle = async (messageId: string) => {
    if (showTranslation.has(messageId)) {
      // Hide translation
      const newShowTranslation = new Set(showTranslation);
      newShowTranslation.delete(messageId);
      setShowTranslation(newShowTranslation);
      // Scroll to show the message after toggling
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      // Check if translation exists
      const message = messages.find(m => m.id === messageId);
      if (message?.translation) {
        // Show existing translation
        const newShowTranslation = new Set(showTranslation);
        newShowTranslation.add(messageId);
        setShowTranslation(newShowTranslation);
        // Scroll to show the message after toggling
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        // Start translating
        const newTranslating = new Set(translatingMessages);
        newTranslating.add(messageId);
        setTranslatingMessages(newTranslating);

        try {
          // Call backend API for translation
          const data = await apiFetch<{ translatedText?: string }>('/chatbot/translate', {
            method: 'POST',
            body: JSON.stringify({ text: message?.text || '' }),
          });
          const translatedText = data?.translatedText || '[Translation unavailable]';

          setMessages(prev => prev.map(m =>
            m.id === messageId
              ? { ...m, translation: translatedText }
              : m
          ));

          const newTranslating = new Set(translatingMessages);
          newTranslating.delete(messageId);
          setTranslatingMessages(newTranslating);

          const newShowTranslation = new Set(showTranslation);
          newShowTranslation.add(messageId);
          setShowTranslation(newShowTranslation);

          // Scroll to show the translated message
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 150);
        } catch (error) {
          console.error('Translation error:', error);
          const newTranslating = new Set(translatingMessages);
          newTranslating.delete(messageId);
          setTranslatingMessages(newTranslating);
        }
      }
    }
  };

  const handleQuickAction = async (action: string) => {
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

    // Hide quick actions immediately
    setQuickActions([]);

    try {
      // Call backend API for chatbot response
      const data = await apiFetch<{ response?: string }>('/chatbot/chat', {
        method: 'POST',
        body: JSON.stringify({ text: action, mode: 'main', userRole }),
      });
      const aiResponse = data?.response || '[No response]';

      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);

      // Scroll to bottom after bot response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Fetch quick actions (fire-and-forget)
      (async () => {
        try {
          const qaData = await apiFetch<{ quickActions?: string[] }>('/chatbot/chat', {
            method: 'POST',
            body: JSON.stringify({ text: action, mode: 'quickActions', userRole }),
          });
          if (Array.isArray(qaData.quickActions)) {
            setQuickActions(qaData.quickActions.slice(0, 3));
            // Scroll again after quick actions load
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 250);
          }
        } catch (err) {
          // Silently fallback - error already handled by apiFetch
        }
      })();
    } catch (error) {
      console.error('Error calling backend chatbot:', error);
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. ResQWave is a LoRa-powered emergency communication system that helps communities during floods. Please try asking your question again, or contact our support team at resqwaveinfo@gmail.com for immediate assistance.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);

      // Show fallback quick actions
      setQuickActions([
        'What is ResQWave for?',
        'How do I send an SOS alert?',
        'How to use the terminal?',
      ]);

      // Scroll to bottom after error response and quick actions
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 250);
    }
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

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: insets.top + 10,
          left: 16,
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
        <ArrowLeft size={20} color="#FFFFFF" />
      </TouchableOpacity>

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
              contentContainerStyle={{
                paddingTop: 10,
                paddingBottom: 12,
                flexGrow: 1,
                justifyContent: 'space-between'
              }}
              showsVerticalScrollIndicator={false}
            >
              <View>
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
                          {message.sender === 'bot' && showTranslation.has(message.id) && message.translation
                            ? message.translation
                            : message.text}
                        </Text>
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
              </View>

              {/* Quick Actions - At bottom when minimal content, scrollable with messages */}
              {greetingShown && quickActions.length > 0 && (
                <View style={{ marginTop: 4, marginBottom: 8 }}>
                  {quickActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        backgroundColor: '#2B2B2B',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 6,
                        marginBottom: index === quickActions.length - 1 ? 0 : 8,
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
              )}
            </ScrollView>

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
                  backgroundColor: isTyping ? '#1D1D1D' : '#3B82F6',
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
