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
        return Promise.resolve(value || null);
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
    const token = await webTokenStorage.get();
    if (token === MOCK_TOKEN) {
      console.log('[Auth] Unauthorized (Mock) - ignoring');
      return;
    }

    console.log('[Auth] Unauthorized - clearing auth state');
    await webTokenStorage.clear();
    authStore.setState({ isAuthenticated: false, isLoading: false });
  },
  timeout,
});

export const MOCK_TOKEN = 'mock-token-123';
export const MOCK_USER: User = {
  i: 'user_23456789',
  f_n: 'John',
  l_n: 'Doe',
  u: 'johndoe',
  c_at: new Date().toISOString(),
  e: 'john.doe@example.com',
  is_email_verified: true,
  is_active: true,
  p_id: 'p_123',
  is_admin: true,
};

export const MOCK_TASKS = [
  {
    task_id: 'task-1',
    whatsapp_chat_id: '12345',
    card_type: 'message',
    task_description: 'Analyze group chats',
    task_message: 'Hi John, I found some interesting items in the group.',
    task_category: 'Tasks',
    last_updated_at: new Date().toISOString(),
  },
  {
    task_id: 'task-2',
    whatsapp_chat_id: '67890',
    card_type: 'message',
    task_description: 'Follow up on email',
    task_message: 'John, you have an unread urgent email from the boss.',
    task_category: 'Work',
    last_updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const MOCK_SUGGESTIONS = [
  {
    _id: 'sugg-1',
    user_id: MOCK_USER.i,
    suggestion_type: 'rule',
    status: 'pending',
    why: 'To automate responses in the Work group',
    chats: [{ w_id: '12345', chat_name: 'Work' }],
    rule: 'Notify on mentions',
    action: 'notify',
    display_rule: 'When I am mentioned in Work',
    deadline: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_CONNECTORS = {
  count: 2,
  available_services: ['google_drive', 'whatsapp'],
};

export const MOCK_GROUPS = {
  groups: [
    {
      w_id: 'group-1',
      chat_name: 'Product Team',
      num_active_rules: 2,
      num_inactive_rules: 1,
      moderation_status: true,
    },
    {
      w_id: 'group-2',
      chat_name: 'Marketing Updates',
      num_active_rules: 0,
      num_inactive_rules: 1,
      moderation_status: false,
    },
  ],
  chats: [
    {
      w_id: 'chat-1',
      chat_name: 'Alice Smith',
      num_active_rules: 1,
      num_inactive_rules: 0,
      moderation_status: true,
    },
  ],
  num_groups: 2,
  num_chats: 1,
};

export const MOCK_RULES = [
  {
    rule_id: 'rule-1',
    w_id: ['group-1'],
    raw_text: 'Auto-reply to price inquiries with the catalog link.',
    status: 'active',
    is_default: false,
    created_at: new Date().toISOString(),
    last_triggered_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    rule_id: 'rule-2',
    w_id: ['group-1', 'chat-1'],
    raw_text: 'Notify me whenever a message contains keywords: "urgent", "help".',
    status: 'inactive',
    is_default: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    last_triggered_at: null,
  },
];

// Configure mock handler
apiClient.setMockHandler((url, method) => {
  if (method === 'GET') {
    if (url === '/v1/users/me') return MOCK_USER;
    if (url === '/v1/dashboard/apex-tasks') return MOCK_TASKS;
    if (url === '/v1/suggestions') return MOCK_SUGGESTIONS;
    if (url === '/v1/connectors/all') return MOCK_CONNECTORS;
    if (url.startsWith('/v1/groups')) return MOCK_GROUPS;
    if (url === '/v1/rules') return MOCK_RULES;
    if (url.includes('/rules') && url.startsWith('/v1/rules/')) return MOCK_RULES;
    if (url.startsWith('/v1/connectors/connect/')) {
      return { redirect_url: 'https://example.com/mock-connector-auth' };
    }
  }
  
  if (method === 'POST' || method === 'PATCH' || method === 'DELETE' || method === 'PUT') {
    console.log(`[Mock] Intercepting ${method} ${url}`);
    
    // Mock dashboard task submission
    if (url.startsWith('/v1/dashboard/apex-task/')) {
      return { success: true, message: 'Task submitted successfully (Mock)' };
    }

    // Mock group update mutation
    if (url === '/v1/groups' && (method === 'POST' || method === 'PUT')) {
      return { success: true, job_id: 'mock-job-id' };
    }

    // Mock rule creation
    if (url === '/v1/rules' && method === 'POST') {
      return { success: 'true', rule_id: `rule_${Math.floor(Math.random() * 100000)}` };
    }
    
    // Default success for other mutations
    return { success: true, message: 'Action completed successfully (Mock)' };
  }
  
  return null;
});

// Check if user has valid token on startup
export async function hydrateAuthState(): Promise<boolean> {
  const token = await webTokenStorage.get();
  console.log('[Auth] Hydrating auth state, token found:', !!token);

  if (token) {
    authStore.setState({ isAuthenticated: true, isLoading: false });
    return true;
  }

  authStore.setState({ isAuthenticated: false, isLoading: false });
  return false;
}

// Verify auth by making an API call and return user data
// Browser sends HttpOnly cookie automatically with withCredentials: true
export async function verifyAuthState(): Promise<User | null> {
  const token = await webTokenStorage.get();
  
  // Handle mock token for development
  if (token === MOCK_TOKEN) {
    console.log('[Auth] Using mock token, skipping API verification');
    authStore.setState({ isAuthenticated: true, isLoading: false });
    return MOCK_USER;
  }

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

// Mock login for development
export async function mockLogin(): Promise<void> {
  console.log('[Auth] Performing mock login...');
  
  // Set mock token in storage
  await webTokenStorage.set(MOCK_TOKEN);

  // Seed React Query cache to prevent failing /users/me call from resetting UI
  const { queryClient, USER_QUERY_KEY } = await import('@repo/core');
  queryClient.setQueryData(USER_QUERY_KEY, MOCK_USER);

  // Update auth store
  authStore.setState({ isAuthenticated: true, isLoading: false });
}

export { apiClient, getApiClient };
