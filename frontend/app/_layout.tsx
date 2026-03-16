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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { setGlobalLogoutCallback } from '@/lib/api-client';
import { WithSplashScreen } from '@/components/ui/splash-screen';
import { EditModeProvider } from '@/contexts/edit-mode-context';

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
} from '@expo-google-fonts/geist';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'geist-thin': Geist_100Thin,
    'geist-extralight': Geist_200ExtraLight,
    'geist-light': Geist_300Light,
    'geist-regular': Geist_400Regular,
    'geist-medium': Geist_500Medium,
    'geist-semibold': Geist_600SemiBold,
    'geist-bold': Geist_700Bold,
    'geist-extrabold': Geist_800ExtraBold,
  });

  // Log font errors but don't hard-fail — allows graceful fallback to system fonts
  useEffect(() => {
    if (fontError) {
      console.warn('⚠️ Font download failed (DEV SERVER):', fontError.message);
      console.warn('App will continue with system fonts as fallback.');
    }
  }, [fontError]);

  // Set up global logout callback for 401/403 errors
  useEffect(() => {
    setGlobalLogoutCallback(() => {
      console.log('🔄 Session expired, redirecting to homescreen...');
      router.replace('/');
    });
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize app - fonts optional, continue after 2 seconds even if they fail
  useEffect(() => {
    if (fontError && minTimeElapsed) {
      console.log('⚡ app starting without fonts (font download failed)');
      setIsAppReady(true);
      return;
    }

    if (fontsLoaded && minTimeElapsed) {
      console.log('✅ app ready with fonts and fonts loaded');
      setIsAppReady(true);
    }
  }, [fontsLoaded, fontError, minTimeElapsed]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <EditModeProvider>
          <BottomSheetModalProvider>
            <ThemeProvider
              value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
              <WithSplashScreen isAppReady={isAppReady}>
                <StatusBar style="light" />
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
              </WithSplashScreen>
            </ThemeProvider>
          </BottomSheetModalProvider>
        </EditModeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
