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
      {/* Top row: Greeting and Avatar */}
      <AnimatePresence>
        {!isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-muted-foreground">{greeting}</p>
              <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
            </div>
            <UserMenu userName={userName} userAvatar={userAvatar} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks, rules..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          className="h-12 pl-11 pr-10"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
