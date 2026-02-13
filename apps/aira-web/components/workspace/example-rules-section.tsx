'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Bell,
  ListChecks,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const EXAMPLE_RULES = [
  {
    id: '1',
    text: 'Summarize new WhatsApp messages daily and send me a digest',
    icon: FileText,
    iconClass: 'bg-gradient-to-br from-emerald-500 to-teal-400',
  },
  {
    id: '2',
    text: 'Notify me when someone mentions @me in the group chat',
    icon: Bell,
    iconClass: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
  {
    id: '3',
    text: 'Summarize the key decisions and action items from group discussions',
    icon: ListChecks,
    iconClass: 'bg-gradient-to-br from-rose-500 to-red-500',
  },
  {
    id: '4',
    text: 'Translate important messages to English in real-time',
    icon: MessageCircle,
    iconClass: 'bg-gradient-to-br from-violet-500 to-purple-500',
  },
  {
    id: '5',
    text: 'Remind me of upcoming events mentioned in the group',
    icon: Calendar,
    iconClass: 'bg-gradient-to-br from-sky-500 to-blue-500',
  },
  {
    id: '6',
    text: 'Highlight the most interesting or viral messages each day',
    icon: Sparkles,
    iconClass: 'bg-gradient-to-br from-pink-500 to-fuchsia-500',
  },
];

const INITIAL_COUNT = 3;

export function ExampleRulesSection({ className }: { className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const visibleRules = expanded ? EXAMPLE_RULES : EXAMPLE_RULES.slice(0, INITIAL_COUNT);
  const hasMore = EXAMPLE_RULES.length > INITIAL_COUNT;

  return (
    <div className={cn('w-full', className)}>
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Example rules
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {visibleRules.map((example, index) => {
          const Icon = example.icon;
          return (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, INITIAL_COUNT) * 0.05 }}
              className="contents"
            >
              <Link
                href={`${ROUTES.RULES_NEW}?suggestion=${encodeURIComponent(example.text)}`}
                className="group inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-secondary/80 px-3.5 py-2.5 text-left transition-all hover:border-primary/30 hover:bg-secondary"
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ring-white/10',
                    example.iconClass,
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-white drop-shadow-sm" />
                </div>
                <span
                  className="min-w-0 max-w-[160px] truncate text-sm font-medium text-foreground"
                  title={example.text}
                >
                  {example.text}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          );
        })}
        <AnimatePresence>
          {hasMore && (
            <motion.div
              key="more"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="contents"
            >
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-medium transition-all',
                  expanded
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border/60 bg-secondary/80 text-muted-foreground hover:border-primary/30 hover:bg-secondary hover:text-foreground',
                )}
              >
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')}
                />
                {expanded ? 'Show less' : 'More'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
