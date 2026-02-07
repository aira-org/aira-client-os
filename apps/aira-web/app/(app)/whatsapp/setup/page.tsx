'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check, Info } from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { HowToLinkDialog, SyncingAssistantAvatar } from '@/components/whatsapp';
import { cn } from '@/lib/utils';
import { ROUTES, SPRING_CONFIG } from '@/lib/constants';
import {
  useWahaConnect,
  useWahaLinkPolling,
  useIsWahaConnected,
  useWahaLinkCode,
} from '@repo/core';
import Header from '@/components/ui/header';
import { useToast } from '@/components/ui/toast';

// WhatsApp Logo SVG Component
function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn('h-6 w-6 text-[#25D366]', className)}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M414.73,97.1A222.14,222.14,0,0,0,256.94,32C134,32,33.92,131.58,33.87,254A220.61,220.61,0,0,0,63.65,365L32,480l118.25-30.87a223.63,223.63,0,0,0,106.6,27h.09c122.93,0,223-99.59,223.06-222A220.18,220.18,0,0,0,414.73,97.1ZM256.94,438.66h-.08a185.75,185.75,0,0,1-94.36-25.72l-6.77-4L85.56,427.26l18.73-68.09-4.41-7A183.46,183.46,0,0,1,71.53,254c0-101.73,83.21-184.5,185.48-184.5A185,185,0,0,1,442.34,254.14C442.3,355.88,359.13,438.66,256.94,438.66ZM358.63,300.47c-5.57-2.78-33-16.2-38.08-18.05s-8.83-2.78-12.54,2.78-14.4,18-17.65,21.75-6.5,4.16-12.07,1.38-23.54-8.63-44.83-27.53c-16.57-14.71-27.75-32.87-31-38.42s-.35-8.56,2.44-11.32c2.51-2.49,5.57-6.48,8.36-9.72s3.72-5.56,5.57-9.26.93-6.94-.46-9.71-12.54-30.08-17.18-41.19c-4.53-10.82-9.12-9.35-12.54-9.52-3.25-.16-7-.2-10.69-.2a20.53,20.53,0,0,0-14.86,6.94c-5.11,5.56-19.51,19-19.51,46.28s20,53.68,22.76,57.38,39.3,59.73,95.21,83.76a323.11,323.11,0,0,0,31.78,11.68c13.35,4.22,25.5,3.63,35.1,2.2,10.71-1.59,33-13.42,37.63-26.38s4.64-24.06,3.25-26.37S364.21,303.24,358.63,300.47Z"
      />
    </svg>
  );
}

// Code Loading Shimmer Component
function CodeLoadingShimmer() {
  return (
    <div className="flex items-center justify-center gap-3">
      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="h-10 w-20 rounded-lg bg-muted"
      />
      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        className="h-10 w-20 rounded-lg bg-muted"
      />
    </div>
  );
}

// Action Button Component
function ActionButton({
  onClick,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {icon}
      <span className="text-sm font-semibold text-primary">{label}</span>
    </motion.button>
  );
}

export default function WhatsAppSetupPage() {
  const router = useRouter();
  const [showHowTo, setShowHowTo] = React.useState(false);
  const [copied, setCopied] = useState(false);
  const hasCalledConnect = useRef(false);

  // Connect mutation
  const { mutate: connect } = useWahaConnect();

  // Get link code from store (set by connect mutation)
  const linkCode = useWahaLinkCode();

  const isWahaConnected = useIsWahaConnected();

  const { showToast } = useToast();

  const { reset } = useWahaLinkPolling({
    onSyncStart: () => {
      showToast(
        'Sync started! Let AiRA do the heavy lifting, sit back and relax.',
        'info',
        { persistent: true },
      );
      router.push(ROUTES.HUB);
    },
    onSyncComplete: message => {
      showToast(message ?? 'Chats synced successfully!', 'success', {
        navigateTo: ROUTES.WHATSAPP_GROUP_SELECTION,
        persistent: true,
      });
    },
  });

  const handleConnectError = useCallback(() => {
    showToast('Max limit reached! Please try again later.', 'error');
    router.back();
  }, [showToast, router]);

  useEffect(() => {
    if (!hasCalledConnect.current && !linkCode && !isWahaConnected) {
      hasCalledConnect.current = true;
      connect(undefined, {
        onError: handleConnectError,
      });
    }
  }, [connect, linkCode, isWahaConnected, handleConnectError]);

  useEffect(() => {
    if (isWahaConnected) {
      router.push(ROUTES.WHATSAPP_CONNECTED);
    }
  }, [isWahaConnected, router]);

  const handleRefresh = () => {
    reset();
    connect(undefined, {
      onError: handleConnectError,
    });
  };

  const handleCopy = async () => {
    if (!linkCode) return;
    try {
      await navigator.clipboard.writeText(linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const code = linkCode ?? '';
  const formattedCode = code ? `${code.slice(0, 4)} ${code.slice(4)}` : '';

  return (
    <ScreenLayout maxWidth="md" className="py-4 h-screen" padded={false}>
      <div className="px-4  flex flex-col h-full">
        {/* Header */}
        <Header title={'WhatsApp'} align={'left'} close={true} />
        {/* Boarding Pass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl flex flex-col border flex-1 border-border bg-card shadow-lg"
        >
          {/* Info Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setShowHowTo(true)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Info className="h-5 w-5" />
          </motion.button>

          {/* Code Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center px-6 pb-6 pt-8"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Your Linking Code
            </p>

            {/* Code Display */}
            <div className="mb-4 min-h-12">
              {linkCode ? (
                <motion.p
                  key={linkCode}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-mono text-4xl font-bold tracking-[0.2em] text-foreground"
                >
                  {formattedCode}
                </motion.p>
              ) : (
                <CodeLoadingShimmer />
              )}
            </div>

            {/* Expiry Indicator */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
              <p className="text-xs text-muted-foreground">
                Code expires in 5 minutes
              </p>
            </div>
          </motion.div>

          {/* Details Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-stretch border-y border-border bg-primary/5 px-6 py-4"
          >
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Connection
              </p>
              <div className="flex items-center gap-2">
                <WhatsAppLogo className="h-5 w-5" />
                <span className="font-semibold text-foreground">WhatsApp</span>
              </div>
            </div>

            <div className="mx-4 w-px bg-border" />

            <div className="flex-1 text-right">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <span className="font-semibold text-foreground">Linking</span>
            </div>
          </motion.div>

          {/* Actions Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 px-6 py-5"
          >
            <ActionButton
              onClick={handleCopy}
              icon={
                copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4 text-primary" />
                )
              }
              label={copied ? 'Copied!' : 'Copy Code'}
              disabled={!linkCode}
            />

            <div className="h-6 w-px bg-border" />

            <ActionButton
              onClick={handleRefresh}
              icon={<RefreshCw className={cn('h-4 w-4 text-primary')} />}
              label="New Code"
            />
          </motion.div>

          {/* Tear Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-4"
          >
            <div className="border-t border-dashed border-border" />
          </motion.div>

          {/* Character Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col flex-1 justify-center items-center gap-4 px-6 py-8"
          >
            <SyncingAssistantAvatar size={80} />
            <div className="text-center">
              <h3 className="font-semibold text-foreground">
                Syncing with WhatsApp
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the code in WhatsApp to complete linking
              </p>
            </div>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 pb-6 text-xs text-muted-foreground"
          >
            <button className="underline hover:text-foreground">
              Terms and Conditions
            </button>
            <span>•</span>
            <button className="underline hover:text-foreground">
              Privacy Policy
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* How to Link Dialog */}
      <HowToLinkDialog open={showHowTo} onOpenChange={setShowHowTo} />
    </ScreenLayout>
  );
}
