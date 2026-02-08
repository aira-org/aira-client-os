'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

interface CategoryTabsProps {
  activeCategory: string;
  suggestionCount?: number;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export function CategoryTabs({
  activeCategory,
  suggestionCount = 0,
  onCategoryChange,
  className,
}: CategoryTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto py-2  scrollbar-none',
        className,
      )}
    >
      {CATEGORIES.map(category => {
        const isActive = activeCategory === category.id;
        const isSuggestions = category.id === 'suggestions';

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              />
            )}

            {/* Label */}
            <span className="relative z-10">{category.label}</span>

            {/* 🔴 Suggestion badge */}
            {isSuggestions && suggestionCount > 0 && (
              <span className="absolute -top-1 -right-1.5  flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-destructive-foreground">
                {suggestionCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
