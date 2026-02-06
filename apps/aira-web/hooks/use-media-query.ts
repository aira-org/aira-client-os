'use client';

import { useSyncExternalStore } from 'react';

function subscribeToMediaQuery(
  query: string,
  callback: () => void,
): () => void {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getMediaQuerySnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    callback => subscribeToMediaQuery(query, callback),
    () => getMediaQuerySnapshot(query),
    () => false,
  );
}

// Convenience hooks for common breakpoints
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
