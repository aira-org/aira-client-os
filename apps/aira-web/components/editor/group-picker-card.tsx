'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupPickerCardProps {
  selectedCount: number;
  onClick: () => void;
  className?: string;
}

export function GroupPickerCard({
  selectedCount,
  onClick,
  className,
}: GroupPickerCardProps) {
  const hasSelection = selectedCount > 0;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50',
        className,
      )}
    >
      {!hasSelection ? (
        <div className="flex items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-[15px] font-semibold text-foreground">
              Select Groups & Chats
            </p>
            <p className="text-[13px] text-muted-foreground">
              Choose where to apply this rule
            </p>
          </div>
          <ChevronRight className="h-[18px] w-[18px] text-muted-foreground" />
        </div>
      ) : (
        <div className="flex items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
            <Users className="h-[18px] w-[18px] text-primary-foreground" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-[15px] font-semibold text-foreground">
              {selectedCount} {selectedCount === 1 ? 'chat' : 'chats'} selected
            </p>
            <p className="text-[13px] text-muted-foreground">
              Tap to edit selection
            </p>
          </div>
          <ChevronRight className="h-[18px] w-[18px] text-muted-foreground" />
        </div>
      )}
    </motion.button>
  );
}
