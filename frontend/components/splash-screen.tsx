import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Text, View } from 'react-native';

const LOADING_IMAGE = 'LOADING_IMAGE';
const WAIT_FOR_APP_TO_BE_READY = 'WAIT_FOR_APP_TO_BE_READY';
const FADE_OUT = 'FADE_OUT';
const HIDDEN = 'HIDDEN';

interface WithSplashScreenProps {
  isAppReady: boolean;
  children: React.ReactNode;
}

export function WithSplashScreen({ isAppReady, children }: WithSplashScreenProps) {
  return (
    <>
      {children}
      <Splash isAppReady={isAppReady} />
    </>
  );
}

interface SplashProps {
  isAppReady: boolean;
}

const Splash = ({ isAppReady }: SplashProps) => {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;
  const [state, setState] = useState(WAIT_FOR_APP_TO_BE_READY);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (state === WAIT_FOR_APP_TO_BE_READY) {
      if (isAppReady) {
        setState(FADE_OUT);
      }
    }
  }, [isAppReady, state]);

  useEffect(() => {
    if (state === FADE_OUT) {
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 800,
          delay: 0,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
        Animated.timing(containerScale, {
          toValue: 0.95,
          duration: 800,
          delay: 0,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
      ]).start(() => {
        setState(HIDDEN);
        SplashScreen.hideAsync();
      });
    }
  }, [containerOpacity, containerScale, state]);

  if (state === HIDDEN) return null;

  return (
    <Animated.View
      className="absolute inset-0 z-[9999]"
      style={{
        opacity: containerOpacity,
        transform: [{ scale: containerScale }],
      }}
      pointerEvents="none"
    >
      <LinearGradient
        colors={colors.gradients.background}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.8, y: 0.8 }}
        className="flex-1 justify-center items-center"
      >
        <View className="items-center justify-center">
          <Image
            source={require('@/assets/images/resqwave-logo.png')}
            className="w-[120px] h-[120px] mb-8"
            resizeMode="contain"
          />
          <Text 
            className="text-2xl text-white tracking-[8px]"
            style={{ fontFamily: 'geist-medium' }}
          >
            RESQWAVE
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};