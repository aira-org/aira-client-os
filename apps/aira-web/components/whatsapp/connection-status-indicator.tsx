'use client';

import { motion } from 'framer-motion';
import { Loader2, Wifi, WifiOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConnectionStatus =
  | 'idle'
  | 'polling'
  | 'checking'
  | 'syncing'
  | 'success'
  | 'error';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: Wifi,
    label: 'Ready to connect',
    color: 'text-muted-foreground',
    animate: false,
  },
  polling: {
    icon: Wifi,
    label: 'Waiting for WhatsApp link...',
    color: 'text-primary',
    animate: true,
  },
  checking: {
    icon: Loader2,
    label: 'Checking connection...',
    color: 'text-primary',
    animate: true,
  },
  syncing: {
    icon: Loader2,
    label: 'Connecting and syncing...',
    color: 'text-primary',
    animate: true,
  },
  success: {
    icon: CheckCircle2,
    label: 'Connected successfully!',
    color: 'text-green-500',
    animate: false,
  },
  error: {
    icon: AlertCircle,
    label: 'Connection failed',
    color: 'text-destructive',
    animate: false,
  },
} as const;

export function ConnectionStatusIndicator({
  status,
  className,
}: ConnectionStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {config.animate ? (
        <motion.div
          animate={{
            rotate: config.icon === Loader2 ? 360 : 0,
            scale: config.icon === Wifi ? [1, 1.1, 1] : 1,
          }}
          transition={{
            rotate: {
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <Icon className={cn('h-4 w-4', config.color)} />
        </motion.div>
      ) : (
        <Icon className={cn('h-4 w-4', config.color)} />
      )}
      <span className={cn('text-sm font-medium', config.color)}>
        {config.label}
      </span>

      {/* Active polling indicator - pulse effect */}
      {status === 'polling' && (
        <motion.div
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-2 w-2 rounded-full bg-primary"
        />
      )}
    </div>
  );
}
