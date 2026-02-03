import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';

interface RefreshNotificationProps {
  visible: boolean;
  type: 'success' | 'error';
  message: string;
  title?: string; // Optional custom title
  onDismiss: () => void;
}

export function RefreshNotification({
  visible,
  type,
  message,
  title,
  onDismiss,
}: RefreshNotificationProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = React.useCallback(() => {
    if (isAnimating) return; // Prevent multiple simultaneous dismiss animations
    
    setIsAnimating(true);
    
    // Clear auto-dismiss timer if it exists
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      onDismiss();
    });
  }, [translateY, opacity, onDismiss, isAnimating]);

  useEffect(() => {
    if (visible) {
      // Reset animation state
      setIsAnimating(false);
      
      // Slide in and fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      autoDismissTimer.current = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => {
        if (autoDismissTimer.current) {
          clearTimeout(autoDismissTimer.current);
          autoDismissTimer.current = null;
        }
      };
    }
    // Don't call handleDismiss in else - let parent control visibility
  }, [visible, translateY, opacity]); // Removed handleDismiss from dependencies

  if (!visible) {
    return null;
  }

  const isSuccess = type === 'success';
  const iconColor = isSuccess ? '#22c55e' : '#ef4444';
  const borderColor = isSuccess ? '#22c55e' : '#ef4444';
  const bgIconColor = isSuccess ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.alert, { borderColor: borderColor + '80' }]}>
        <View style={[styles.iconContainer, { backgroundColor: bgIconColor }]}>
          {isSuccess ? (
            <CheckCircle size={20} color={iconColor} />
          ) : (
            <XCircle size={20} color={iconColor} />
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {title || (isSuccess ? 'Success' : 'Error')}
          </Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.dismissButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below the status bar, above the navigation
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  alert: {
    backgroundColor: '#171717',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Geist-SemiBold',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Geist-Regular',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  dismissText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '300',
  },
});
