'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';

interface HubHeaderProps {
  userName?: string;
  userAvatar?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  className?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HubHeader({
  userName = 'there',
  userAvatar,
  searchQuery,
  onSearchChange,
  isSearchFocused,
  onSearchFocus,
  onSearchBlur,
  className,
}: HubHeaderProps) {
  const greeting = getGreeting();

  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            {greeting}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground truncate"
          >
            {userName}
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.15,
            type: 'spring',
            damping: 15,
            stiffness: 200,
          }}
          className="shrink-0"
        >
          <UserMenu userName={userName} userAvatar={userAvatar} />
        </motion.div>
      </div>

      <motion.div
        className="relative"
        animate={{ scale: isSearchFocused ? 1.02 : 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks, rules..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          className={cn(
            'h-12 pl-11 pr-10 transition-shadow duration-200',
            isSearchFocused && 'ring-2 ring-primary/20 shadow-lg',
          )}
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
