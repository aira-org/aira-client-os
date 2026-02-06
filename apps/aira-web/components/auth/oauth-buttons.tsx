'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OAuthButtonsProps {
  onGoogleClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

// Google Icon SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function OAuthButtons({
  onGoogleClick,
  className,
  isLoading = false,
}: OAuthButtonsProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn('w-full space-y-4', className)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          onClick={onGoogleClick}
          disabled={isLoading}
          variant="outline"
          size="default"
          className="relative w-full overflow-hidden border-border bg-card hover:bg-card/80"
        >
          {/* Shimmer effect */}
          {isHovered && !isLoading && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
          )}

          <GoogleIcon className="mr-3 h-5 w-5" />
          <span className="text-base font-medium">
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </Button>
      </motion.div>
    </div>
  );
}
