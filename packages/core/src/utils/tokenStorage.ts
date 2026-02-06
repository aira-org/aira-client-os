import { TOKEN_KEY } from '../auth/constants';

declare const document: { cookie: string } | undefined;

export interface TokenStorage {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

export const createTokenStorage = (): TokenStorage => ({
  get() {
    return Promise.resolve(null);
  },
  set(token: string) {
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=31536000; SameSite=Strict`;
    }
    return Promise.resolve();
  },
  clear() {
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    return Promise.resolve();
  },
});
