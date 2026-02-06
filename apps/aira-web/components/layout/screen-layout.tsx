'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ScreenLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Whether to use max-width container */
  contained?: boolean;
  /** Whether to add padding */
  padded?: boolean;
  /** Custom max width class */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

export function ScreenLayout({
  children,
  className,
  contained = true,
  padded = true,
  maxWidth = 'lg',
}: ScreenLayoutProps) {
  return (
    <main
      className={cn(
        'min-h-screen w-full bg-background',
        contained && 'mx-auto',
        contained && maxWidthClasses[maxWidth],
        padded && 'px-4 md:px-6',
        className,
      )}
    >
      {children}
    </main>
  );
}
