'use client';

import { ROUTES } from '@/lib/constants';
import { useIsAuthenticated, useIsAuthLoading, useUser } from '@repo/core';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireActive?: boolean;
}

export function AuthGuard({ children, requireActive = true }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const isAuthenticated = useIsAuthenticated();
  const isAuthLoading = useIsAuthLoading();
  const { data: user, isLoading: isUserLoading } = useUser();

  // Consolidate loading states to prevent UI flickering
  const checkingAuth = isAuthLoading;
  const checkingStatus = requireActive && isUserLoading;

  useEffect(() => {
    if (checkingAuth) return;

    // 1. Handle Unauthenticated
    if (!isAuthenticated) {
      if (pathname !== ROUTES.SIGNIN) {
        router.replace(ROUTES.SIGNIN);
      }
      return;
    }

    // 2. Handle Inactive User (Phone Verification)
    // Only redirect if they aren't already on the phone page to prevent loops
    if (requireActive && !isUserLoading && user && !user.is_active) {
      if (pathname !== ROUTES.PHONE) {
        router.replace(ROUTES.PHONE);
      }
    }
  }, [
    isAuthenticated, 
    checkingAuth, 
    user?.is_active, 
    isUserLoading, 
    requireActive, 
    router, 
    pathname
  ]);

  // Show a single consistent loader for any blocking state
  if (checkingAuth || checkingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  // Safety: Prevent rendering children if we know a redirect should be happening
  if (!isAuthenticated && pathname !== ROUTES.SIGNIN) return null;
  if (requireActive && user && !user.is_active && pathname !== ROUTES.PHONE) return null;

  return <>{children}</>;
}