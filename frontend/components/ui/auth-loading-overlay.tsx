import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';

interface AuthLoadingOverlayProps {
  visible: boolean;
  message: string;
  progress?: number;
}

export function AuthLoadingOverlay({ visible, message, progress }: AuthLoadingOverlayProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(visible ? 1 : 0.98)).current;

  const normalizedProgress =
    typeof progress === 'number' && Number.isFinite(progress)
      ? Math.max(0, Math.min(100, Math.round(progress)))
      : undefined;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setShouldRender(false);
      }
    });
  }, [visible, opacity, scale]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(10, 15, 28, 0.72)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        zIndex: 9999,
      }}
    >
      <Animated.View
        style={{
          minWidth: 180,
          borderRadius: 14,
          paddingHorizontal: 18,
          paddingVertical: 16,
          backgroundColor: 'rgba(23, 23, 23, 0.95)',
          borderWidth: 1,
          borderColor: 'rgba(59, 130, 246, 0.55)',
          alignItems: 'center',
          transform: [{ scale }],
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text
          style={{
            marginTop: 10,
            color: '#FFFFFF',
            fontSize: 14,
            fontFamily: 'Geist-Medium',
          }}
        >
          {message}
        </Text>

        {typeof normalizedProgress === 'number' ? (
          <View style={{ width: '100%', marginTop: 10 }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontFamily: 'Geist-Medium',
                textAlign: 'center',
              }}
            >
              {normalizedProgress}%
            </Text>

            <View
              style={{
                height: 6,
                marginTop: 8,
                borderRadius: 999,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${normalizedProgress}%`,
                  backgroundColor: '#3B82F6',
                }}
              />
            </View>
          </View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}
