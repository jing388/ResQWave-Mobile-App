import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Load Geist fonts
import {
  Geist_100Thin,
  Geist_200ExtraLight,
  Geist_300Light,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  Geist_900Black,
} from '@expo-google-fonts/geist';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    'geist-thin': Geist_100Thin,
    'geist-extralight': Geist_200ExtraLight,
    'geist-light': Geist_300Light,
    'geist-regular': Geist_400Regular,
    'geist-medium': Geist_500Medium,
    'geist-semibold': Geist_600SemiBold,
    'geist-bold': Geist_700Bold,
    'geist-extrabold': Geist_800ExtraBold,
    'geist-black': Geist_900Black,
  });

  // Show nothing while fonts are loading
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="login/index"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="login/forgot-password/find-your-account"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="login/forgot-password/enter-code-sent"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="login/forgot-password/reset-password"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="verification/index"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="profile/index"
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="profile/password"
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="profile/first-and-last-name"
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="profile/phone-number"
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="profile/email"
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'slide_from_right',
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
