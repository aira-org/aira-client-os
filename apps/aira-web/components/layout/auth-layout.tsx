'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Show the brand header */
  showBrand?: boolean;
  /** Subtitle context */
  subtitle?: string;
}

export function AuthLayout({
  children,
  className,
  showBrand = true,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-background px-4',
        className,
      )}
    >
      <div className="w-full max-w-md">
        {showBrand && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              AiRA
            </h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            )}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mx-auto mt-2 h-1 w-12 rounded-full bg-primary"
            />
          </motion.div>
        )}
        {children}
      </div>
    </div>
  );
}
