'use client';

import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { cn } from '@/lib/utils';
import { SPRING_CONFIG, ROUTES } from '@/lib/constants';
import { useUpdateWahaGroups } from '@repo/core';
import { useToast } from '@/components/ui/toast';

const PHASES = [
  'Scanning messages',
  'Processing patterns',
  'Learning context',
  'Optimizing',
];

const ITEM_HEIGHT = 48;

// Spinner component
function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Loader2 className="h-4 w-4 text-primary" />
    </motion.div>
  );
}

// Picker item component
interface PickerItemProps {
  label: string;
  index: number;
  currentPhase: number;
}

function PickerItem({ label, index, currentPhase }: PickerItemProps) {
  const isActive = index === currentPhase;
  const isCompleted = index < currentPhase;
  const isPending = index > currentPhase;

  // Calculate position based on current phase
  const offset = (index - currentPhase) * ITEM_HEIGHT;

  return (
    <motion.div
      className="absolute left-0 right-0 flex h-12 items-center justify-start px-4"
      initial={{ y: index * ITEM_HEIGHT, opacity: 0 }}
      animate={{
        y: offset,
        opacity: isPending ? 0.3 : 1,
        scale: isActive ? 1 : 0.95,
      }}
      transition={{ ...SPRING_CONFIG, duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        {/* Indicator */}
        <div className="flex h-5 w-5 items-center justify-center">
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Spinner />
              </motion.div>
            )}
            {isCompleted && (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Label */}
        <span
          className={cn(
            'text-lg font-medium transition-colors',
            isActive && 'text-foreground',
            isCompleted && 'text-foreground',
            isPending && 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
}

// Final checkmark component
function FinalCheckmark({ isComplete }: { isComplete: boolean }) {
  if (!isComplete) return null;

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Circle with checkmark */}
      <motion.div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-primary"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Check
            className="h-10 w-10 text-primary-foreground"
            strokeWidth={3}
          />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.p
        className="mt-4 text-lg font-semibold text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        All set!
      </motion.p>
    </motion.div>
  );
}

export default function AIAnalysisPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const hasMutatedRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  const navigateToHub = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    sessionStorage.removeItem('aira_selected_chats');
    setIsComplete(true);
    setTimeout(() => {
      router.push(ROUTES.HUB);
    }, 1500);
  }, [router]);

  const updateGroups = useUpdateWahaGroups({
    onJobStart: () => {
      console.warn('[AIAnalysis] Job started, SSE connected');
      navigateToHub();
    },
    onJobComplete: message => {
      console.warn('[AIAnalysis] Job complete, showing toast');
      showToast(message ?? 'AI analysis complete!', 'success', {
        navigateTo: '/?tab=suggestions',
        persistent: true,
      });
    },
    onNoJob: () => {
      console.warn('[AIAnalysis] No job_id, navigating to hub');
      navigateToHub();
    },
  });

  useEffect(() => {
    if (hasMutatedRef.current) return;

    const storedChats = sessionStorage.getItem('aira_selected_chats');
    if (!storedChats) {
      router.push(ROUTES.WHATSAPP_GROUP_SELECTION);
      return;
    }

    try {
      const chats = JSON.parse(storedChats) as Record<string, boolean>;
      hasMutatedRef.current = true;
      updateGroups.mutate(
        { chats },
        {
          onError: error => {
            console.error('[AIAnalysis] Mutation error:', error);
            navigateToHub();
          },
        },
      );
    } catch {
      console.error('[AIAnalysis] Failed to parse stored chats');
      router.push(ROUTES.WHATSAPP_GROUP_SELECTION);
    }
  }, [router, updateGroups, navigateToHub]);

  // Animation phases
  useEffect(() => {
    const times = [1800, 3800, 5800, 7800];
    const ids = times.map((t, i) => setTimeout(() => setCurrentPhase(i), t));
    return () => ids.forEach(clearTimeout);
  }, []);

  // Fallback: navigate after animation completes if nothing else triggered
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.warn('[AIAnalysis] Fallback navigation triggered');
      navigateToHub();
    }, 9000);
    return () => clearTimeout(fallbackTimer);
  }, [navigateToHub]);

  return (
    <ScreenLayout
      maxWidth="md"
      className="flex min-h-screen items-center justify-center"
    >
      <div className="relative w-full px-8">
        {/* Main content */}
        <motion.div
          animate={{ opacity: isComplete ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_CONFIG, delay: 0.2 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Setting up AiRA
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Analyzing your conversations
            </p>
          </motion.div>

          {/* Picker */}
          <div
            className="relative overflow-hidden"
            style={{ height: ITEM_HEIGHT * 3 }}
          >
            {/* Selection highlight */}
            <div
              className="absolute left-0 right-0 rounded-xl bg-muted/50"
              style={{
                height: ITEM_HEIGHT,
                top: ITEM_HEIGHT,
              }}
            />

            {/* Items container */}
            <div
              className="relative"
              style={{ height: ITEM_HEIGHT, marginTop: ITEM_HEIGHT }}
            >
              {PHASES.map((label, i) => (
                <PickerItem
                  key={label}
                  label={label}
                  index={i}
                  currentPhase={currentPhase}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final checkmark */}
        <FinalCheckmark isComplete={isComplete} />
      </div>
    </ScreenLayout>
  );
}
