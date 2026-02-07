import { initApiClient, getApiClient, TOKEN_KEY, authStore } from '@repo/core';
import type { TokenStorage, User } from '@repo/core';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || '';

if (!baseURL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL environment variable is required. ' +
      'Please set it in your .env.local or .env file.',
  );
}

const timeout = 60000;

// Cookie name the backend sets (may differ from TOKEN_KEY used internally)
const BACKEND_COOKIE_NAME = 'access-token';

// Create web-specific token storage that can read from cookies
export const webTokenStorage: TokenStorage = {
  get(): Promise<string | null> {
    if (typeof document === 'undefined') return Promise.resolve(null);
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      // Check both backend cookie name and internal TOKEN_KEY
      if (name === BACKEND_COOKIE_NAME || name === TOKEN_KEY) {
        const v = value?.trim();
        if (v) return Promise.resolve(v);
      }
    }
    return Promise.resolve(null);
  },
  set(token: string): Promise<void> {
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=31536000; SameSite=Strict`;
    }
    return Promise.resolve();
  },
  clear(): Promise<void> {
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    return Promise.resolve();
  },
};

// Google OAuth URL for web
export const GOOGLE_AUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ||
  '';

const apiClient = initApiClient({
  baseURL,
  isNative: false,
  tokenStorage: webTokenStorage,
  onUnauthorized: async () => {
    console.log('[Auth] Unauthorized - clearing auth state');
    await webTokenStorage.clear();
    authStore.setState({ isAuthenticated: false, isLoading: false });
    // Don't redirect here - let AuthGuard handle the redirect
    // This allows verifyAuthState() to complete gracefully
  },
  timeout,
});

// Check if user has valid token on startup
export async function hydrateAuthState(): Promise<boolean> {
  const token = await webTokenStorage.get();
  console.log('[Auth] Hydrating auth state, token found:', !!token);
  console.log(
    '[Auth] All cookies:',
    typeof document !== 'undefined' ? document.cookie : 'SSR',
  );

  if (token) {
    authStore.setState({ isAuthenticated: true, isLoading: false });
    return true;
  }

  // If no token in JS-accessible cookies, the cookie might be HttpOnly
  // In that case, we'll assume authenticated and let the API call verify
  // The useUser hook will fail if not actually authenticated
  authStore.setState({ isAuthenticated: false, isLoading: false });
  return false;
}

// Verify auth by making an API call and return user data
// Browser sends HttpOnly cookie automatically with withCredentials: true
export async function verifyAuthState(): Promise<User | null> {
  console.log('[Auth] Verifying auth state via API...');
  try {
    const client = getApiClient();
    const user = await client.get<User>('/v1/users/me');
    console.log('[Auth] Verification successful, user:', user?.e || user?.i);
    authStore.setState({ isAuthenticated: true, isLoading: false });
    return user;
  } catch (error) {
    console.log('[Auth] Verification failed:', error);
    authStore.setState({ isAuthenticated: false, isLoading: false });
    return null;
  }
}

export { apiClient, getApiClient };
