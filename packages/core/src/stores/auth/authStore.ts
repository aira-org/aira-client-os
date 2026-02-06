import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import { stateStorage } from '../../storage/stateStorage';
import type { TokenStorage } from '../../utils';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
  logout: (tokenStorage?: TokenStorage) => Promise<void>;
}

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer(set => ({
      isAuthenticated: false,
      isLoading: true,
      setAuthenticated: isAuthenticated =>
        set(state => {
          state.isAuthenticated = isAuthenticated;
        }),
      setLoading: isLoading =>
        set(state => {
          state.isLoading = isLoading;
        }),
      clear: () =>
        set(state => {
          state.isAuthenticated = false;
          state.isLoading = false;
        }),
      logout: async (tokenStorage?: TokenStorage) => {
        // Clear the keychain token if tokenStorage is provided
        if (tokenStorage) {
          try {
            await tokenStorage.clear();
          } catch (error) {
            console.error('Failed to clear token from storage:', error);
          }
        }
        // Clear auth state
        set(state => {
          state.isAuthenticated = false;
          state.isLoading = false;
        });
      },
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => stateStorage),
      partialize: (state: AuthState & AuthActions) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const useIsAuthenticated = (): boolean => useAuthStore(s => s.isAuthenticated);
export const useIsAuthLoading = (): boolean => useAuthStore(s => s.isLoading);

export const useAuthActions = (): Pick<
  AuthActions,
  'setAuthenticated' | 'setLoading' | 'clear' | 'logout'
> =>
  useAuthStore(
    useShallow(s => ({
      setAuthenticated: s.setAuthenticated,
      setLoading: s.setLoading,
      clear: s.clear,
      logout: s.logout,
    })),
  );

export const authStore = {
  getState: () => useAuthStore.getState(),
  setState: (state: Partial<AuthState & AuthActions>) => useAuthStore.setState(state),
  subscribe: (listener: (state: AuthState & AuthActions) => void) =>
    useAuthStore.subscribe(listener),
};
