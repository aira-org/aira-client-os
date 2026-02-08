'use client';

import React, { useMemo, useCallback, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from 'framer-motion';
import { Lightbulb, X, RotateCcw } from 'lucide-react';
import { SuggestionCard } from './suggestion-card';
import { cn } from '@/lib/utils';
import type { Suggestion } from '@repo/core';

const SWIPE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 400;

interface SuggestionStackProps {
  suggestions: Suggestion[];
  onCreateRule?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  className?: string;
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 150 }}
        className="mb-4 rounded-3xl bg-card p-6"
      >
        <Lightbulb className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold text-foreground"
      >
        Nothing here yet
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-1 text-sm text-muted-foreground"
      >
        Suggestions appear after AiRA observes activity over time
      </motion.p>
    </motion.div>
  );
}

/* ── Stack offsets inspired by the reference image ──
   Behind cards peek out with slight rotation + vertical/horizontal offset,
   giving the physical "deck of cards" look. */
const STACK_CONFIG = [
  { scale: 1, y: 0, rotate: 0, x: 0, opacity: 1 },
  { scale: 0.96, y: 12, rotate: 2, x: 6, opacity: 0.7 },
  { scale: 0.92, y: 24, rotate: -1.5, x: -4, opacity: 0.45 },
];

interface StackedCardProps {
  index: number;
  isTopCard: boolean;
  children: React.ReactNode;
  onSwipe?: (direction: number) => void;
}

function StackedCard({
  index,
  isTopCard,
  children,
  onSwipe,
}: StackedCardProps) {
  const config = STACK_CONFIG[index] ?? STACK_CONFIG[STACK_CONFIG.length - 1]!;
  const zIndex = 10 - index;

  const controls = useAnimation();
  const [isDismissing, setIsDismissing] = useState(false);

  const dragX = useMotionValue(0);
  const cardRotate = useTransform(dragX, [-300, 0, 300], [-10, 0, 10]);
  const dragOpacity = useTransform(
    dragX,
    [-SWIPE_THRESHOLD * 1.5, 0, SWIPE_THRESHOLD * 1.5],
    [0.65, 1, 0.65],
  );

  // Swipe indicators
  const leftIndicator = useTransform(
    dragX,
    [-SWIPE_THRESHOLD, -30, 0],
    [1, 0, 0],
  );
  const rightIndicator = useTransform(
    dragX,
    [0, 30, SWIPE_THRESHOLD],
    [0, 0, 1],
  );

  const handleDragEnd = useCallback(
    async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const shouldSwipe =
        Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
        Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;

      if (shouldSwipe && onSwipe) {
        const dir = info.offset.x > 0 ? 1 : -1;
        setIsDismissing(true);

        await controls.start({
          x: dir * 500,
          opacity: 0,
          rotate: dir * 20,
          transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
        });

        onSwipe(dir);
      } else {
        controls.start({
          x: 0,
          transition: { type: 'spring', damping: 30, stiffness: 400 },
        });
      }
    },
    [onSwipe, controls],
  );

  return (
    <motion.div
      layout={!isDismissing}
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      animate={
        isDismissing
          ? controls
          : {
              opacity: config.opacity,
              y: config.y,
              scale: config.scale,
              rotate: config.rotate,
              x: config.x,
            }
      }
      exit={{
        opacity: 0,
        scale: 0.88,
        y: -30,
        transition: { duration: 0.22, ease: 'easeOut' },
      }}
      transition={{
        type: 'spring',
        damping: 22,
        stiffness: 160,
        duration: 0.4,
      }}
      style={{
        zIndex,
        x: isTopCard ? dragX : config.x,
        rotate: isTopCard ? cardRotate : config.rotate,
        opacity: isTopCard ? dragOpacity : config.opacity,
      }}
      drag={isTopCard && !isDismissing ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={isTopCard ? handleDragEnd : undefined}
      whileDrag={{ cursor: 'grabbing' }}
      className={cn(
        'absolute inset-0 origin-bottom',
        !isTopCard && 'pointer-events-none',
        isTopCard && 'cursor-grab',
      )}
    >
      {/* Swipe indicators */}
      {isTopCard && (
        <>
          <motion.div
            style={{ opacity: leftIndicator }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/15 text-destructive backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </motion.div>
          <motion.div
            style={{ opacity: rightIndicator }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.div>
        </>
      )}

      {/* The card itself — large rounded corners like the reference */}
      <div
        className={cn(
          'h-full w-full rounded-[24px] border border-border bg-card flex flex-col overflow-hidden',
          isTopCard
            ? 'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]'
            : 'shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]',
        )}
      >
        <div className="flex-1 min-h-0 p-6 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function SuggestionStack({
  suggestions,
  onCreateRule,
  onDismiss,
  onSendToBack,
  className,
}: SuggestionStackProps) {
  const visibleSuggestions = useMemo(
    () => suggestions.slice(0, 3),
    [suggestions],
  );

  const handleSwipe = useCallback(
    (suggestionId: string, direction: number) => {
      if (direction < 0) {
        onDismiss?.(suggestionId);
      } else {
        onSendToBack?.(suggestionId);
      }
    },
    [onDismiss, onSendToBack],
  );

  if (suggestions.length === 0) {
    return <EmptyState />;
  }

  const cardElements = visibleSuggestions
    .map((suggestion, index) => {
      const isTopCard = index === 0;

      return (
        <StackedCard
          key={suggestion._id}
          index={index}
          isTopCard={isTopCard}
          onSwipe={direction => handleSwipe(suggestion._id, direction)}
        >
          <SuggestionCard
            id={suggestion._id}
            rule={suggestion.rule}
            displayRule={suggestion.display_rule}
            why={suggestion.why}
            action={suggestion.action}
            chats={suggestion.chats}
            deadline={suggestion.deadline}
            timestamp={formatRelativeTime(suggestion.created_at)}
            onCreateRule={() => onCreateRule?.(suggestion._id)}
            onDismiss={() => onDismiss?.(suggestion._id)}
          />
        </StackedCard>
      );
    })
    .reverse();

  return (
    <div className={cn('relative w-full', className)}>
      {/* Counter pill */}
      {suggestions.length > 1 && (
        <motion.div
          key={suggestions.length}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-3 right-4 z-30 flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2.5"
        >
          <span className="text-[11px] font-bold text-primary-foreground">
            {suggestions.length}
          </span>
        </motion.div>
      )}

      {/* Stack area — enough height for card + behind-card peek */}
      <div
        className="relative w-full min-h-[480px]"
        style={{ paddingBottom: 28 }}
      >
        <AnimatePresence mode="popLayout">{cardElements}</AnimatePresence>
      </div>

      {/* Hint */}
      {suggestions.length > 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-3 text-center text-[11px] text-muted-foreground/50 tracking-wide"
        >
          swipe left to dismiss · right to skip
        </motion.p>
      )}
    </div>
  );
}
