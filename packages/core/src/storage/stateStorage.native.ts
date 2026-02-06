import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const mmkv = createMMKV({ id: 'aira-state' });

export const stateStorage: StateStorage = {
  getItem: (name: string) => mmkv.getString(name) ?? null,
  setItem: (name: string, value: string) => mmkv.set(name, value),
  removeItem: (name: string) => mmkv.remove(name),
};
