import { HapticTab } from '@/components/ui/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { FileText, Home, Map } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions } from 'react-native';

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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const [activeTab, setActiveTab] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

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
          tabBarStyle: {
            paddingTop: 15,
            height: 90,
            backgroundColor: '#171717',
            borderColor: '#94A3B8',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            marginTop: 4,
            marginBottom: 4,
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
          options={{
            title: 'Map',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused} IconComponent={Map} size={26} />
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
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused} IconComponent={FileText} size={26} />
            ),
          }}
        />
      </Tabs>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 88,
          left: 0,
          width: tabWidth,
          height: 2,
          backgroundColor: '#3B82F6',
          transform: [{ translateX: slideAnim }],
        }}
        pointerEvents="none"
      />
    </View>
  );
}
