import { HapticTab } from '@/components/ui/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEditMode } from '@/contexts/edit-mode-context';
import { Tabs } from 'expo-router';
import { FileText, Home, Map } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');
const tabWidth = screenWidth / 3;

const TabBarIcon = React.memo(({
  focused,
  IconComponent,
  size = 24,
}: {
  focused: boolean;
  IconComponent: any;
  size?: number;
}) => {
  return (
    <View className="flex-1 justify-center items-center relative" style={{ width: '100%', alignItems: 'center' }}>
      <IconComponent size={size} color={focused ? '#3B82F6' : '#FFFFFF'} />
    </View>
  );
});
TabBarIcon.displayName = 'TabBarIcon';

// separate label component so we can guarantee color logic (blue when focused,
// white otherwise). using a render callback avoids style merging issues.
const TabBarLabel = React.memo(({
  focused,
  text,
}: {
  focused: boolean;
  text: string;
}) => (
  <View>
    <Text
      style={{
        fontSize: 11,
        marginTop: 2,
        marginBottom: 0,
        fontWeight: '500',
        color: focused ? '#3B82F6' : '#FFFFFF',
      }}
    >
      {text}
    </Text>
  </View>
));
TabBarLabel.displayName = 'TabBarLabel';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { isEditMode } = useEditMode();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Tab bar composed height: fixed content area + system nav inset
  const TAB_CONTENT_H = 50;
  // always add a little extra bottom padding so the bar lives above
  // any system navigation controls; safeBottom is usually 0 on Android
  // when the screen isn't inset-aware, so we add 6px baseline.
  const EXTRA_BOTTOM = 6;
  const tabBarHeight = TAB_CONTENT_H + safeBottom + EXTRA_BOTTOM;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab * tabWidth,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [activeTab, slideAnim]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#FFFFFF',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: true,
          lazy: true,
          tabBarHideOnKeyboard: true,
          tabBarActiveIndicatorStyle: { backgroundColor: 'transparent' },
          tabBarStyle: {
            paddingTop: 8,
            // combine safe inset with a small constant to guarantee separation
            paddingBottom: safeBottom + EXTRA_BOTTOM,
            height: tabBarHeight,
            backgroundColor: '#171717',
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            marginTop: 2,
            marginBottom: 0,
            fontWeight: '500',
            color: '#FFFFFF',
          },
        }}
        screenListeners={{
          state: (e) => {
            const state = e.data.state;
            if (state) {
              setActiveTab(state.index);
            }
          },
        }}
      >
        <Tabs.Screen
          name="index"
          listeners={{
            tabPress: (e) => {
              if (isEditMode) {
                e.preventDefault();
              }
            },
          }}
          options={{
            title: 'Map',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={isEditMode ? false : focused} IconComponent={Map} size={26} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={isEditMode ? false : focused} text="Map" />
            ),
          }}
        />
        <Tabs.Screen
          name="about-neighborhood"
          options={{
            title: 'Info',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused} IconComponent={Home} size={26} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused} text="Info" />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          listeners={{
            tabPress: (e) => {
              if (isEditMode) {
                e.preventDefault();
              }
            },
          }}
          options={{
            title: 'Reports',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={isEditMode ? false : focused} IconComponent={FileText} size={26} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={isEditMode ? false : focused} text="Reports" />
            ),
          }}
        />
      </Tabs>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: safeBottom + TAB_CONTENT_H,
          left: 0,
          width: tabWidth,
          height: 3,
          backgroundColor: '#3B82F6',
          transform: [{ translateX: slideAnim }],
          borderRadius: 2,
          zIndex: 999,
          elevation: 10,
        }}
        pointerEvents="none"
      />
    </View>
  );
}
