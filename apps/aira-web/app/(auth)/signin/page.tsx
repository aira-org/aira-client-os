'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/layout';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { GOOGLE_AUTH_URL } from '@/lib/api';
import { Shield, Zap, Lock } from 'lucide-react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

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
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome to AiRA
          </h1>
          <p className="text-muted-foreground text-balance">
            Your personal AI operating system. <br/>
            Connect your world, automate your life.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-4">
          <OAuthButtons
            onGoogleClick={handleGoogleSignIn}
            isLoading={isLoading}
          />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground/70">
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
          <div className="group space-y-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <p className="font-medium">Secure</p>
          </div>
          <div className="group space-y-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="font-medium">Fast</p>
          </div>
          <div className="group space-y-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <p className="font-medium">Private</p>
          </div>
        </motion.div>

        {/* Footer Links */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>
            By continuing, you agree to our{' '}
            <Link
              href="https://airaai.in/terms-of-use"
              className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-all"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="https://airaai.in/privacy-policy"
              className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-all"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
