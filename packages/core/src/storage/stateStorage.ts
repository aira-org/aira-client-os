import type { StateStorage } from 'zustand/middleware';

declare const localStorage:
  | {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
    }
  | undefined;

export const stateStorage: StateStorage = {
  getItem: (name: string) => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(name);
    }
    return null;
  },
  setItem: (name: string, value: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(name);
    }
  },
};
