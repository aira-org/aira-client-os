'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectingAnimationProps {
  className?: string;
}

export function ConnectingAnimation({ className }: ConnectingAnimationProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8',
        className,
      )}
    >
      {/* WhatsApp Icon with pulse */}
      <div className="relative mb-6">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-whatsapp/30"
          style={{ transform: 'scale(1.5)' }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp/20">
          <MessageCircle className="h-8 w-8 text-whatsapp" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-foreground">
        Connecting to WhatsApp
      </h3>

      {/* Animated dots */}
      <div className="mt-2 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{
              y: [-3, 3, -3],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            className="h-2 w-2 rounded-full bg-whatsapp"
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Open WhatsApp on your phone and enter the code above
      </p>
    </div>
  );
}
