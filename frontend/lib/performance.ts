/**
 * Performance Optimization Configuration
 * 
 * This file contains settings and utilities to improve app performance
 */

import { LogBox } from 'react-native';

// Enable React Native performance monitoring
if (__DEV__) {
  // Enable React DevTools profiler in development
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);
}

// Performance monitoring config
export const PERFORMANCE_CONFIG = {
  // Enable lazy loading for heavy components
  enableLazyLoading: true,
  
  // Animation durations (in ms)
  animations: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  
  // Image optimization
  images: {
    // Reduce quality for thumbnails
    thumbnailQuality: 0.6,
    // Reduce quality for full images
    fullImageQuality: 0.8,
    // Enable image caching
    enableCaching: true,
  },
  
  // List rendering optimization
  lists: {
    // Number of items to render initially
    initialNumToRender: 10,
    // Window size for virtualized lists
    windowSize: 5,
    // Max items to render per batch
    maxToRenderPerBatch: 5,
    // Update cells batch period
    updateCellsBatchingPeriod: 50,
  },
  
  // Map optimization
  map: {
    // Reduce marker density when zoomed out
    clusterMarkers: true,
    // Marker limit before clustering
    markerLimit: 50,
    // Update interval for location (ms)
    locationUpdateInterval: 5000,
  },
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
