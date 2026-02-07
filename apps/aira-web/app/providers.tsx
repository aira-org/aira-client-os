'use client';

import { useEffect } from 'react';
import { QueryClientProvider, queryClient } from '@repo/core';
import { ToastProvider } from '@/components/ui/toast';
import { verifyAuthState } from '@/lib/api';

import '@/lib/api';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    verifyAuthState();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
