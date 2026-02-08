'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Calendar,
  HardDrive,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface RuleItemProps {
  id: string;
  title: string;
  description: string;
  connectorType: 'whatsapp' | 'email' | 'calendar' | 'drive';
  isEnabled: boolean;
  onToggle?: (enabled: boolean) => void;
  onClick?: () => void;
  className?: string;
  chatCount?: string;
  statusText?: string;
}

const connectorIcons = {
  whatsapp: MessageCircle,
  email: Mail,
  calendar: Calendar,
  drive: HardDrive,
};

const connectorColors = {
  whatsapp: 'text-whatsapp',
  email: 'text-email',
  calendar: 'text-calendar',
  drive: 'text-drive',
};

export function RuleItem({
  id: _id,
  title,
  description,
  connectorType,
  isEnabled,
  onToggle,
  onClick,
  className,
  chatCount,
  statusText,
}: RuleItemProps) {
  const Icon = connectorIcons[connectorType];

  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card
        className={cn(
          'cursor-pointer transition-colors hover:border-primary/50',
          !isEnabled && 'opacity-60',
        )}
      >
        <CardContent className="flex items-center gap-4 p-4">
          {/* Icon */}
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card',
              connectorColors[connectorType],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 cursor-pointer" onClick={onClick}>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground">{title}</h4>
              {chatCount && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {chatCount}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {description}
            </p>
            {statusText && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {statusText}
              </p>
            )}
          </div>

          {/* Toggle */}
          <Switch
            checked={isEnabled}
            onCheckedChange={onToggle}
            onClick={e => e.stopPropagation()}
          />

          {/* Arrow */}
          <ChevronRight
            className="h-5 w-5 shrink-0 text-muted-foreground"
            onClick={onClick}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
