'use client';

import { useEffect } from 'react';
import { QueryClientProvider, queryClient } from '@repo/core';
import { verifyAuthState } from '@/lib/api';

// Initialize API client on module load
import '@/lib/api';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    verifyAuthState();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
