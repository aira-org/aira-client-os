'use client';

import React from 'react';
import { Plus, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  id: string;
  rule: string;
  displayRule: string;
  why: string;
  action: string;
  chats: Array<{ w_id?: string; chat_name?: string }>;
  deadline?: string | null;
  timestamp: string;
  onCreateRule?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function SuggestionCard({
  rule,
  displayRule,
  why,
  action: _action,
  chats,
  timestamp,
  onCreateRule,
  onDismiss,
  className,
}: SuggestionCardProps) {
  const title = displayRule || rule;

  return (
    <div className={cn('flex h-full min-h-0 flex-col select-none', className)}>
      {/* Top row — label + time */}
      <div className="shrink-0 flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Suggested Rule
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {timestamp}
        </span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable] pr-1">
        {/* Title */}
        <h3 className="text-[15px] font-semibold leading-[1.4] text-foreground mb-3">
          {title}
        </h3>

        {/* Divider */}
        <div className="h-px bg-border/50 mb-3" />

        {/* Why */}
        {why && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">
              Why
            </p>
            <p className="text-[12px] leading-[1.6] text-muted-foreground whitespace-pre-wrap">
              {why}
            </p>
          </div>
        )}

        {/* Chat pills */}
        {chats.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chats.map((chat, index) => (
              <span
                key={chat.w_id || index}
                className="inline-flex items-center gap-1 rounded-full bg-card border border-border/60 px-2.5 py-1 text-[11px] font-medium text-foreground/70"
              >
                <MessageCircle className="h-2.5 w-2.5 text-whatsapp" />
                {chat.chat_name || 'Unknown chat'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex gap-3 pt-4 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-10 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
          onClick={onDismiss}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Dismiss
        </Button>
        <Button
          size="sm"
          className="flex-1 h-10 rounded-xl text-xs"
          onClick={onCreateRule}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create Rule
        </Button>
      </div>
    </div>
  );
}
