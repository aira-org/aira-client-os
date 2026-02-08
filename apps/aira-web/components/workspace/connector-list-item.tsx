'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Calendar, HardDrive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConnectorListItemProps {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'calendar' | 'drive';
  isConnected: boolean;
  subtitle?: string;
  meta?: string;
  rulesCount?: number;
  onClick?: () => void;
  isLoading?: boolean;
  index: number;
  health?: 'healthy' | 'error' | 'warning';
}

const connectorIcons = {
  whatsapp: MessageCircle,
  email: Mail,
  calendar: Calendar,
  drive: HardDrive,
};

const connectorColors = {
  whatsapp: 'bg-muted text-muted-foreground',
  email: 'bg-muted text-muted-foreground',
  calendar: 'bg-muted text-muted-foreground',
  drive: 'bg-muted text-muted-foreground',
};

export function ConnectorListItem({
  name,
  type,
  isConnected,
  subtitle,
  meta,
  onClick,
  isLoading,
  index,
  health,
}: ConnectorListItemProps) {
  const Icon = connectorIcons[type];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50',
        isLoading && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            connectorColors[type],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground">{name}</h3>
            {isConnected && (
              <div className="flex items-center gap-3">
                {health === 'healthy' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Healthy</span>
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className="shrink-0 text-primary-foreground text-[10px] font-medium px-2 py-0.5 bg-primary"
                >
                  CONNECTED
                </Badge>
              </div>
            )}
          </div>

          {/* Subtitle */}
          <p className="mt-0.5 text-sm text-muted-foreground">
            {subtitle || (isConnected ? 'Tap to manage' : 'Tap to connect')}
          </p>

          {/* Meta info */}
          {meta && (
            <p className="mt-1 text-xs text-muted-foreground/70">{meta}</p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
