import { HapticTab } from '@/components/ui/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { FileText, Info, Map } from 'lucide-react-native';
import { View } from 'react-native';

const TabBarIcon = ({
  focused,
  IconComponent,
  size = 24,
}: {
  focused: boolean;
  IconComponent: any;
  size?: number;
}) => (
  <View
    className={`w-20 h-14 rounded-lg justify-center items-center ${focused ? 'bg-blue-500/15' : ''}`}
  >
    <IconComponent size={size} color={focused ? '#3B82F6' : '#FFFFFF'} />
  </View>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: 15,
          height: 80,
          backgroundColor: '#171717',
          borderColor: '#94A3B8',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Barangay Map',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} IconComponent={Map} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="about-neighborhood"
        options={{
          title: 'About Neighborhood',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} IconComponent={Info} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} IconComponent={FileText} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
