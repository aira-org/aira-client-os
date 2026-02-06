'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  className,
}: CategoryTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-2 scrollbar-none',
        className,
      )}
    >
      {CATEGORIES.map(category => {
        const isActive = activeCategory === category.id;

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
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
