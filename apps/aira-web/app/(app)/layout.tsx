import React from 'react';
import { ToastProvider } from '@/components/ui/toast';
import AppShell from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/auth';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
    </AuthGuard>
  );
}
