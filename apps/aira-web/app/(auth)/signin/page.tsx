'use client';

import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { AuthLayout } from '@/components/layout';
import { GOOGLE_AUTH_URL } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    useEffect(() => 
      {
     const result = hydrateAuthState().catch(error => {
      console.error('Error hydrating auth state:', error);
    });
    if (result) {
      navigate.push('/'); 
    }
  }, []);

    // Redirect to Google OAuth URL with web state
    const authUrl = `${GOOGLE_AUTH_URL}?state=auth:web`;

    if (GOOGLE_AUTH_URL) {
      window.location.href = authUrl;
    } else {
      console.error('GOOGLE_AUTH_URL is not configured');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-8"
      >
        {/* Description */}
        <div className="text-center"></div>

        {/* OAuth Buttons */}
        <OAuthButtons
          onGoogleClick={handleGoogleSignIn}
          isLoading={isLoading}
        />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Secure authentication
            </span>
          </div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground"
        >
          <div className="space-y-1">
            <div className="mx-auto h-8 w-8 rounded-lg bg-card p-2">
              <svg
                className="h-full w-full text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p>Secure</p>
          </div>
          <div className="space-y-1">
            <div className="mx-auto h-8 w-8 rounded-lg bg-card p-2">
              <svg
                className="h-full w-full text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <p>Fast</p>
          </div>
          <div className="space-y-1">
            <div className="mx-auto h-8 w-8 rounded-lg bg-card p-2">
              <svg
                className="h-full w-full text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p>Private</p>
          </div>
        </motion.div>

        {/* Footer Links */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link
              href="https://airaai.in/terms-of-use"
              className="text-primary hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="https://airaai.in/privacy-policy"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
