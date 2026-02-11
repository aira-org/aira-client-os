'use client';

import { create } from 'zustand';

interface LayoutState {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>(set => ({
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () =>
    set(state => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));

