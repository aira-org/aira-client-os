'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/layout';
import { ROUTES } from '@/lib/constants';
import { verifyAuthState } from '@/lib/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle OAuth callback
  // Backend has set HttpOnly cookie, so we verify auth by calling /users/me
  // If it succeeds, user is authenticated (browser sends cookie automatically)
  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      queueMicrotask(() =>
        setErrorMessage('Authentication failed. Please try again.'),
      );
      setTimeout(() => router.push(ROUTES.SIGNIN), 2000);
      return;
    }

    // Verify auth and get user data
    const verifyAndRedirect = async () => {
      console.log('[AuthCallback] Verifying auth via /users/me');
      const user = await verifyAuthState();
      if (user) {
        console.log(
          '[AuthCallback] User fetched successfully, is_active:',
          user.is_active,
        );

        // Redirect based on is_active status
        if (user.is_active) {
          router.replace(ROUTES.HUB);
        } else {
          router.replace(ROUTES.PHONE);
        }
      } else {
        console.error('[AuthCallback] Failed to verify auth');
        queueMicrotask(() =>
          setErrorMessage('Authentication failed. Please try again.'),
        );
        setTimeout(() => router.push(ROUTES.SIGNIN), 2000);
      }
    };

    verifyAndRedirect();
  }, [searchParams, router]);

  return (
    <AuthLayout showBrand={false}>
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Loading Animation */}
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="h-16 w-16 rounded-full border-2 border-border border-t-primary"
          />

          {/* Inner pulsing dot */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          />
        </div>

        {/* Status Text */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-semibold text-foreground"
          >
            {errorMessage || 'Authenticating'}
          </motion.h2>

          {/* Animated dots */}
          {!errorMessage && (
            <div className="mt-2 flex items-center justify-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="h-2 w-2 rounded-full bg-muted-foreground"
                />
              ))}
            </div>
          )}
        </div>

        {/* Cancel link */}
        <button
          onClick={() => router.push(ROUTES.SIGNIN)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </AuthLayout>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout showBrand={false}>
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="h-16 w-16 rounded-full border-2 border-border border-t-primary animate-spin" />
            <p className="text-lg font-semibold text-foreground">
              Authenticating
            </p>
          </div>
        </AuthLayout>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
