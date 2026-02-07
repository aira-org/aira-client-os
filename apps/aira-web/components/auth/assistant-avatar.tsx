'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AssistantAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function AssistantAvatar({
  className,
  size = 'md',
  animate = true,
}: AssistantAvatarProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5',
        sizeClasses[size],
        className,
      )}
    >
      {/* Inner circle with animation */}
      <motion.div
        animate={
          animate
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex h-3/4 w-3/4 items-center justify-center rounded-full bg-primary/30"
      >
        {/* Core */}
        <motion.div
          animate={
            animate
              ? {
                  opacity: [0.7, 1, 0.7],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-1/2 w-1/2 rounded-full bg-primary"
        />
      </motion.div>

      {/* Floating particles */}
      {animate && (
        <>
          <motion.div
            animate={{
              y: [-5, 5, -5],
              x: [-2, 2, -2],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -right-1 top-1/4 h-2 w-2 rounded-full bg-primary/60"
          />
          <motion.div
            animate={{
              y: [5, -5, 5],
              x: [2, -2, 2],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute -left-1 bottom-1/4 h-1.5 w-1.5 rounded-full bg-primary/40"
          />
        </>
      )}
    </motion.div>
  );
}
