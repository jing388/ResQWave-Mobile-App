import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for backend requests.  It can be overridden by setting the
// Expo public environment variable `EXPO_PUBLIC_API_URL` (e.g. in
// `.env` or `app.config.js`).
//
// When not provided we fall back to a sensible default used during
// development; update this if you want a different hard‑coded value.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://resqwave-2awf.onrender.com';

// Storage keys
const TOKEN_KEY = '@auth_token';

interface RefreshTokenResponse {
  token?: string;
}

// Global logout handler for 401/403 errors
let logoutCallback: (() => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setGlobalLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

async function clearAuthAndLogout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem('@auth_user');

  if (logoutCallback) {
    logoutCallback();
  }
}

function isRefreshableAuthError(status: number, message: string): boolean {
  if (status !== 401 && status !== 403) {
    return false;
  }

  const normalized = String(message || '').toLowerCase();
  return (
    normalized.includes('expired') ||
    normalized.includes('invalid token') ||
    normalized.includes('invalid or expired token') ||
    normalized.includes('session expired') ||
    normalized.includes('jwt expired')
  );
}

async function refreshToken(currentToken: string): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshUrl = `${API_BASE_URL}/refresh`;
      console.log('🔄 Attempting token refresh...');

      const refreshResponse = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!refreshResponse.ok) {
        console.warn('⚠️ Token refresh failed with status:', refreshResponse.status);
        return null;
      }

      const data = await refreshResponse.json() as RefreshTokenResponse;
      if (!data?.token) {
        console.warn('⚠️ Token refresh response did not include a token');
        return null;
      }

      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      console.log('✅ Token refresh successful');
      return data.token;
    } catch (error: any) {
      console.warn('⚠️ Token refresh request failed:', error?.message || error);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Centralized API fetch function
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retryAfterRefresh: boolean = true,
): Promise<T> {
  // Get token from AsyncStorage
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  // Public endpoints that should not include auth tokens
  const publicEndpoints = [
    '/focal/login',
    '/focal/register',
    '/focal/verify',
    '/focal/resend',
    '/focal/reset',
    '/verifyResetCode',
    '/resetPassword',
    '/chatbot/chat',
    '/chatbot/translate',
  ];
  const isPublicEndpoint = publicEndpoints.some((pubEndpoint) =>
    endpoint.startsWith(pubEndpoint),
  );

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
  if (token && !isPublicEndpoint) {
    console.log('🔑 Token found, adding to headers');
  } else if (isPublicEndpoint) {
    console.log('🔓 Public endpoint, no auth required');
  } else {
    console.log('🔓 No token found');
  }

  try {
    // Add timeout to prevent hanging requests (60 seconds for Render cold starts)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        // Only set Content-Type for non-FormData requests
        ...(options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }
        ),
        // Only add Authorization header if token exists AND not a public endpoint
        ...(token && !isPublicEndpoint && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);
    console.log(`📥 API Response: ${res.status} ${res.statusText}`);

    // Handle authentication errors
    if (res.status === 401 || res.status === 403) {
      // Try to parse backend message before deciding whether to refresh or logout.
      let errorMessage = 'Session expired. Please login again.';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use default message
      }

      // Attempt one transparent refresh-and-retry for expired/invalid token cases.
      if (
        !isPublicEndpoint &&
        token &&
        retryAfterRefresh &&
        endpoint !== '/refresh' &&
        isRefreshableAuthError(res.status, errorMessage)
      ) {
        const nextToken = await refreshToken(token);
        if (nextToken) {
          return apiFetch<T>(endpoint, options, false);
        }
      }

      console.log('🚫 Authentication error, logging out');
      await clearAuthAndLogout();

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
  } catch (error: any) {
    // Handle timeout errors
    if (error.name === 'AbortError') {
      console.error('⏱️ Request timeout after 60 seconds');
      throw new Error('Request timeout. The server took too long to respond. Please try again.');
    }

    console.error('❌ Network request failed:', error.message);
    console.error('🔧 Debugging info:');
    console.error('  - URL:', url);
    console.error('  - API_BASE_URL:', API_BASE_URL);
    console.error('  - Endpoint:', endpoint);
    console.error('  - Error type:', error.constructor.name);
    console.error('  - Error name:', error.name);
    console.error('  - Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export { API_BASE_URL };
