import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 0,
      gcTime: 10 * 60 * 1000,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
