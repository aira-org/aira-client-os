'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const WELCOME_BANNER_DISMISSED_KEY = 'aira_welcome_banner_dismissed';

interface WelcomeBannerProps {
  className?: string;
}

export function WelcomeBanner({ className }: WelcomeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(WELCOME_BANNER_DISMISSED_KEY);
      setIsDismissed(dismissed === 'true');
    } catch (e) {
      console.warn('WelcomeBanner: localStorage access failed', e);
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(WELCOME_BANNER_DISMISSED_KEY, 'true');
    } catch (e) {
      console.warn('WelcomeBanner: Failed to save dismissal state', e);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'relative overflow-hidden rounded-2xl border border-border bg-card p-5',
            className,
          )}
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Welcome to AiRA
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get started in 3 simple steps
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  1
                </span>
                <span className="text-muted-foreground">
                  Connect your WhatsApp account
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  2
                </span>
                <span className="text-muted-foreground">
                  Create automation rules for your chats
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  3
                </span>
                <span className="text-muted-foreground">
                  Review tasks and let AiRA handle the rest
                </span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={ROUTES.WHATSAPP_SETUP}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Connect WhatsApp
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
