import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:5000';

// Storage keys
const TOKEN_KEY = '@auth_token';

// Global logout handler for 401/403 errors
let logoutCallback: (() => void) | null = null;

export function setGlobalLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

// Centralized API fetch function
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Get token from AsyncStorage
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
  if (token) {
    console.log('🔑 Token found, adding to headers');
  } else {
    console.log('🔓 No token found (login/public endpoint)');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Only add Authorization header if token exists
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  console.log(`📥 API Response: ${res.status} ${res.statusText}`);

  // Handle authentication errors
  if (res.status === 401 || res.status === 403) {
    console.log('🚫 Authentication error, clearing tokens');
    // Clear token and trigger logout
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('@auth_user');

    // Call global logout callback if set
    if (logoutCallback) {
      logoutCallback();
    }

    // Try to parse JSON error message
    let errorMessage = 'Session expired. Please login again.';
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If JSON parsing fails, use default message
    }

    throw new Error(errorMessage);
  }

  if (!res.ok) {
    console.log('❌ Request failed with status:', res.status);
    // Try to parse JSON error message
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
      console.log('Error message:', errorMessage);
    } catch {
      // If JSON parsing fails, try text
      try {
        errorMessage = await res.text();
        console.log('Error text:', errorMessage);
      } catch {
        // Use statusText as fallback
        console.log('Using statusText:', res.statusText);
      }
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export { API_BASE_URL };
