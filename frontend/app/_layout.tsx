import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { setGlobalLogoutCallback } from '@/lib/api-client';
import { WithSplashScreen } from '@/components/ui/splash-screen';

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
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
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

  // Set up global logout callback for 401/403 errors
  useEffect(() => {
    setGlobalLogoutCallback(() => {
      console.log('🔄 Session expired, redirecting to homescreen...');
      router.replace('/');
    });
  }, [router]);

  // Track minimum loading time (3 seconds)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize app - wait for BOTH fonts AND minimum time
  useEffect(() => {
    if (fontError) {
      console.error('❌ Font loading error:', fontError);
      // Still need to wait for minimum time even if fonts fail
      if (minTimeElapsed) {
        setIsAppReady(true);
      }
      return;
    }

    if (fontsLoaded && minTimeElapsed) {
      console.log('✅ Fonts loaded and minimum time elapsed');
      setIsAppReady(true);
    }
  }, [fontsLoaded, fontError, minTimeElapsed])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <WithSplashScreen isAppReady={isAppReady}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade_from_bottom',
                animationDuration: 200,
                animationTypeForReplace: 'push',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            >
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 150,
                }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 200,
                }}
              />
              <Stack.Screen
                name="login/index"
                options={{
                  headerShown: false,
                  animation: 'none',
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
              <Stack.Screen
                name="chatbot/index"
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                  animation: 'slide_from_right',
                }}
              />
            </Stack>
            <StatusBar style="light" />
          </WithSplashScreen>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}