'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TopTabBarProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function TopTabBar({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TopTabBarProps) {
  return (
    <div className={cn('flex rounded-xl bg-card p-1', className)}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg bg-primary"
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
