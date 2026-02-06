import { create } from 'zustand';

interface WahaState {
  isWahaConnected: boolean;
  linkCode: string | null;
  setLinkCode: (code: string | null) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useWahaStore = create<WahaState>(set => ({
  isWahaConnected: false,
  linkCode: null,
  setLinkCode: code => set({ linkCode: code }),
  connect: () => set({ isWahaConnected: true, linkCode: null }),
  disconnect: () => set({ isWahaConnected: false, linkCode: null }),
}));

export const wahaStore = {
  getState: () => useWahaStore.getState(),
};

export const useIsWahaConnected = (): boolean => useWahaStore(s => s.isWahaConnected);
export const useWahaLinkCode = (): string | null => useWahaStore(s => s.linkCode);
