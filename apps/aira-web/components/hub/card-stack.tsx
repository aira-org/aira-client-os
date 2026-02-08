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
import { Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SendMessageCard, type Attachment } from './send-message-card';
import { cn } from '@/lib/utils';
import { SPRING_CONFIG } from '@/lib/constants';

// Swipe configuration
const SWIPE_THRESHOLD = 150;
const SWIPE_VELOCITY_THRESHOLD = 500;

// Card data types matching mobile app
export interface BaseCardData {
  id: string;
  type: 'message' | 'approve' | 'file' | 'image';
  title: string;
  subtitle?: string;
  category: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface MessageCardData extends BaseCardData {
  type: 'message';
  recipient: string;
  platform: 'whatsapp' | 'sms';
}

export type CardData = MessageCardData | BaseCardData;

interface CardStackProps {
  cards: CardData[];
  onSendMessage?: (
    id: string,
    message: string,
    attachments: Attachment[],
  ) => void;
  onDismiss?: (id: string, direction: number) => void;
  className?: string;
  isFiltered?: boolean;
  activeCategory?: string;
  otherCategoryTasks?: { id: string; label: string; count: number }[];
  onCategoryPress?: (categoryId: string) => void;
}

// Priority colors
const priorityColors = {
  high: 'bg-destructive',
  medium: 'bg-primary',
  low: 'bg-emerald-500',
};

// Empty state component
function EmptyState({
  isFiltered = false,
  activeCategory,
  otherCategoryTasks = [],
  onCategoryPress,
}: {
  isFiltered?: boolean;
  activeCategory?: string;
  otherCategoryTasks?: { id: string; label: string; count: number }[];
  onCategoryPress?: (categoryId: string) => void;
}) {
  const totalOtherTasks = otherCategoryTasks.reduce(
    (sum, cat) => sum + cat.count,
    0,
  );

  const getEmptyMessage = () => {
    if (!isFiltered) {
      return {
        title: 'Nothing here yet',
        subtitle: 'Tasks appear after AiRA observes activity over time',
      };
    }

    if (totalOtherTasks > 0) {
      return {
        title: `${activeCategory} cleared!`,
        subtitle: `${totalOtherTasks} task${totalOtherTasks !== 1 ? 's' : ''} in other categories`,
      };
    }

    return {
      title: 'Nothing here yet',
      subtitle: 'Tasks appear after AiRA observes activity over time',
    };
  };

  const { title, subtitle } = getEmptyMessage();

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
        className="mb-4 rounded-2xl bg-card p-6"
      >
        <Inbox className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold text-foreground"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-1 text-sm text-muted-foreground"
      >
        {subtitle}
      </motion.p>

      {/* Category chips for filtered empty state */}
      {isFiltered && totalOtherTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 flex flex-col items-center"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Jump to:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {otherCategoryTasks.map(category => (
              <button
                key={category.id}
                onClick={() => onCategoryPress?.(category.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">
                  {category.label}
                </span>
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-primary text-primary-foreground">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Stacked card wrapper
interface StackedCardProps {
  index: number;
  isTopCard: boolean;
  totalCards: number;
  children: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  onDismiss?: (direction: number) => void;
}

function StackedCard({
  index,
  isTopCard,
  totalCards: _totalCards,
  children,
  priority,
  onDismiss,
}: StackedCardProps) {
  const scale = isTopCard ? 1 : 1 - index * 0.03;
  const translateY = isTopCard ? 0 : index * 8;
  const opacity = isTopCard ? 1 : 1 - index * 0.15;
  const zIndex = 10 - index;

  // Animation controls for programmatic animation
  const controls = useAnimation();
  const [isDismissing, setIsDismissing] = useState(false);

  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const dragOpacity = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    [0.7, 1, 0.7],
  );

  const handleDragEnd = useCallback(
    async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const shouldDismiss =
        Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
        Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;

      if (shouldDismiss && onDismiss) {
        const direction = info.offset.x > 0 ? 1 : -1;
        setIsDismissing(true);

        // Animate card off-screen
        await controls.start({
          x: direction * 500,
          opacity: 0,
          rotate: direction * 20,
          transition: { duration: 0.25, ease: 'easeOut' },
        });

        onDismiss(direction);
      } else {
        // Spring back to center
        controls.start({
          x: 0,
          transition: { type: 'spring', damping: 20, stiffness: 300 },
        });
      }
    },
    [onDismiss, controls],
  );

  return (
    <motion.div
      layout={!isDismissing}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={
        isDismissing
          ? controls
          : {
              opacity,
              y: translateY,
              scale,
            }
      }
      exit={{ opacity: 0, x: -300, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ ...SPRING_CONFIG, duration: 0.3 }}
      style={{
        zIndex,
        x: isTopCard ? x : 0,
        rotate: isTopCard ? rotate : 0,
        opacity: isTopCard ? dragOpacity : opacity,
      }}
      drag={isTopCard && !isDismissing ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={isTopCard ? handleDragEnd : undefined}
      whileDrag={{ cursor: 'grabbing' }}
      className={cn(
        'absolute inset-0',
        !isTopCard && 'pointer-events-none',
        isTopCard && 'cursor-grab',
      )}
    >
      <Card className="relative h-full w-full overflow-hidden">
        {/* Priority indicator */}
        {priority && (
          <div
            className={cn(
              'absolute top-3 right-3 h-2 w-2 rounded-full',
              priorityColors[priority],
            )}
          />
        )}

        <CardContent className="h-full p-5 flex flex-col">
          {children}
        </CardContent>

        {/* Disabled overlay for non-top cards */}
        {!isTopCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-card rounded-lg"
          />
        )}
      </Card>
    </motion.div>
  );
}

export function CardStack({
  cards,
  onSendMessage,
  onDismiss,
  className,
  isFiltered = false,
  activeCategory,
  otherCategoryTasks = [],
  onCategoryPress,
}: CardStackProps) {
  // Only show top 3 cards for visual stack
  const visibleCards = useMemo(() => cards.slice(0, 3), [cards]);

  // Handle swipe dismiss
  const handleSwipeDismiss = useCallback(
    (cardId: string, direction: number) => {
      onDismiss?.(cardId, direction);
    },
    [onDismiss],
  );

  if (cards.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        activeCategory={activeCategory}
        otherCategoryTasks={otherCategoryTasks}
        onCategoryPress={onCategoryPress}
      />
    );
  }

  // Render cards in reverse order so top card is rendered last (on top)
  const cardElements = visibleCards
    .map((card, index) => {
      const isTopCard = index === 0;

      // Handle message card type
      if (card.type === 'message') {
        return (
          <StackedCard
            key={card.id}
            index={index}
            isTopCard={isTopCard}
            totalCards={visibleCards.length}
            priority={card.priority}
            onDismiss={direction => handleSwipeDismiss(card.id, direction)}
          >
            <SendMessageCard
              id={card.id}
              title={card.title}
              subtitle={card.subtitle}
              category={card.category}
              timestamp={card.timestamp}
              onSend={(message, attachments) =>
                onSendMessage?.(card.id, message, attachments)
              }
            />
          </StackedCard>
        );
      }

      // Default card type (approve, file, image, etc.) - fallback
      return (
        <StackedCard
          key={card.id}
          index={index}
          isTopCard={isTopCard}
          totalCards={visibleCards.length}
          priority={card.priority}
          onDismiss={direction => handleSwipeDismiss(card.id, direction)}
        >
          <div className="h-full flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {card.subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{card.category}</span>
              <span>|</span>
              <span>{card.timestamp}</span>
            </div>
          </div>
        </StackedCard>
      );
    })
    .reverse();

  // Calculate container height based on card stack - use flex-1 to fill available space
  const stackOffset = (Math.min(visibleCards.length, 3) - 1) * 8;

  return (
    <div
      className={cn(
        'relative w-full flex-1 min-h-[400px] overflow-y-hidden overflow-x-hidden',
        className,
      )}
      style={{ paddingBottom: stackOffset }}
    >
      <AnimatePresence mode="popLayout">{cardElements}</AnimatePresence>
    </div>
  );
}
