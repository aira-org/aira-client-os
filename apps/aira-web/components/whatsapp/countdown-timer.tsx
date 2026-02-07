'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiryTimeMs: number; // Timestamp when code expires
  onExpiry?: () => void;
  onWarning?: (secondsLeft: number) => void;
}

type UrgencyLevel = 'normal' | 'warning' | 'urgent' | 'critical';

export function CountdownTimer({
  expiryTimeMs,
  onExpiry,
  onWarning,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiryTimeMs - now);
      setTimeLeft(remaining);

      if (remaining === 0 && !hasExpired) {
        setHasExpired(true);
        onExpiry?.();
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiryTimeMs, hasExpired, onExpiry]);

  // Trigger warnings at specific thresholds
  useEffect(() => {
    const secondsLeft = Math.floor(timeLeft / 1000);
    if (secondsLeft === 120 || secondsLeft === 60 || secondsLeft === 30) {
      onWarning?.(secondsLeft);
    }
  }, [timeLeft, onWarning]);

  const getUrgencyLevel = (): UrgencyLevel => {
    const secondsLeft = timeLeft / 1000;
    if (secondsLeft <= 30) return 'critical';
    if (secondsLeft <= 60) return 'urgent';
    if (secondsLeft <= 120) return 'warning';
    return 'normal';
  };

  const formatTime = (): string => {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const urgency = getUrgencyLevel();

  const urgencyConfig = {
    normal: {
      color: 'text-muted-foreground',
      bgColor: 'bg-primary',
      icon: Clock,
      message: 'Code expires in',
    },
    warning: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      icon: Clock,
      message: 'Code expires in',
    },
    urgent: {
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
      icon: AlertCircle,
      message: 'Less than a minute!',
    },
    critical: {
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      icon: AlertCircle,
      message: 'Expiring soon!',
    },
  };

  const config = urgencyConfig[urgency];
  const Icon = config.icon;

  if (hasExpired) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-1.5 w-1.5 rounded-full bg-red-500"
        />
        <p className="text-xs text-red-500">Code expired - getting new one...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: urgency === 'critical' ? 0.8 : urgency === 'urgent' ? 1.2 : 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={cn('h-1.5 w-1.5 rounded-full', config.bgColor)}
      />
      <Icon className={cn('h-3.5 w-3.5', config.color)} />
      <p className={cn('text-xs font-medium', config.color)}>
        {urgency === 'normal' || urgency === 'warning' ? (
          <>
            {config.message} <span className="font-mono">{formatTime()}</span>
          </>
        ) : (
          <>
            {config.message}{' '}
            <span className="font-mono font-bold">{formatTime()}</span>
          </>
        )}
      </p>
    </div>
  );
}
