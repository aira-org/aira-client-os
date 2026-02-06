import * as Keychain from 'react-native-keychain';
import { TOKEN_KEY } from '../auth/constants';

export interface TokenStorage {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

export const createTokenStorage = (): TokenStorage => ({
  async get() {
    const result = await Keychain.getGenericPassword({ service: TOKEN_KEY });
    return result ? result.password : null;
  },
  async set(token: string) {
    await Keychain.setGenericPassword(TOKEN_KEY, token, { service: TOKEN_KEY });
  },
  async clear() {
    await Keychain.resetGenericPassword({ service: TOKEN_KEY });
  },
});
