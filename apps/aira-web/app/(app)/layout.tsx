'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BottomDock } from '@/components/layout';
import { AuthGuard } from '@/components/auth';
import { ToastProvider } from '@/components/ui/toast';

const VISIBLE_DOCK_ROUTES = ['/', '/workspace'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shouldShowDock = VISIBLE_DOCK_ROUTES.some(
    route =>
      pathname === route || (route !== '/' && pathname.startsWith(route)),
  );

  return (
    <AuthGuard>
      <ToastProvider>
        <div className={shouldShowDock ? 'min-h-screen w-full' : 'min-h-screen'}>
          {children}
          <div className='visible md:hidden '>
            {shouldShowDock && <BottomDock />}
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
