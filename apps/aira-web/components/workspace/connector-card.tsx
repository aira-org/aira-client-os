'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Calendar,
  HardDrive,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConnectorCardProps {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'calendar' | 'drive';
  isConnected: boolean;
  rulesCount?: number;
  onClick?: () => void;
  className?: string;
}

const connectorIcons = {
  whatsapp: MessageCircle,
  email: Mail,
  calendar: Calendar,
  drive: HardDrive,
};

const connectorColors = {
  whatsapp: 'bg-whatsapp/20 text-whatsapp',
  email: 'bg-email/20 text-email',
  calendar: 'bg-calendar/20 text-calendar',
  drive: 'bg-drive/20 text-drive',
};

export function ConnectorCard({
  id: _id,
  name,
  type,
  isConnected,
  rulesCount = 0,
  onClick,
  className,
}: ConnectorCardProps) {
  const Icon = connectorIcons[type];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card
        className={cn(
          'cursor-pointer transition-colors hover:border-primary/50',
          isConnected && 'border-primary/30',
        )}
        onClick={onClick}
      >
        <CardContent className="flex flex-col items-center p-4 text-center">
          {/* Icon */}
          <div
            className={cn(
              'mb-3 flex h-14 w-14 items-center justify-center rounded-xl',
              connectorColors[type],
            )}
          >
            <Icon className="h-7 w-7" />
          </div>

          {/* Name */}
          <h3 className="font-medium text-foreground">{name}</h3>

          {/* Status */}
          <div className="mt-2 flex items-center gap-1">
            {isConnected ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                <span className="text-xs text-success">Connected</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Connect</span>
              </>
            )}
          </div>

          {/* Rules count */}
          {isConnected && rulesCount > 0 && (
            <Badge variant="secondary" className="mt-2">
              {rulesCount} rule{rulesCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
