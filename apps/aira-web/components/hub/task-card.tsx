'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Calendar,
  HardDrive,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  source: 'whatsapp' | 'email' | 'calendar' | 'drive';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  onApprove?: () => void;
  onReject?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const sourceIcons = {
  whatsapp: MessageCircle,
  email: Mail,
  calendar: Calendar,
  drive: HardDrive,
};

const sourceColors = {
  whatsapp: 'text-whatsapp',
  email: 'text-email',
  calendar: 'text-calendar',
  drive: 'text-drive',
};

const priorityColors = {
  high: 'bg-destructive',
  medium: 'bg-primary',
  low: 'bg-success',
};

export function TaskCard({
  id: _id,
  title,
  description,
  source,
  priority,
  timestamp,
  onApprove,
  onReject,
  onDismiss,
  className,
}: TaskCardProps) {
  const SourceIcon = sourceIcons[source];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="relative overflow-hidden">
        {/* Priority indicator */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-1',
            priorityColors[priority],
          )}
        />

        <CardContent className="p-4 pl-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              {/* Header */}
              <div className="flex items-center gap-2">
                <SourceIcon className={cn('h-4 w-4', sourceColors[source])} />
                <span className="text-xs text-muted-foreground capitalize">
                  {source}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timestamp}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDismiss}>Dismiss</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions */}
          {(onApprove || onReject) && (
            <div className="mt-4 flex gap-2">
              {onApprove && (
                <Button
                  onClick={onApprove}
                  size="sm"
                  className="flex-1 bg-success/20 text-success hover:bg-success/30"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              {onReject && (
                <Button
                  onClick={onReject}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
