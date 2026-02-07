'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SyncingAssistantAvatarProps {
  size?: number;
  className?: string;
}

/**
 * The AiRA assistant character performing a syncing action.
 * Features:
 * - Body rotates side to side (looking around)
 * - Eyes blink periodically
 * - Floating animation
 * - Pulsing glow effect
 * - Floating particles around the character
 */
export function SyncingAssistantAvatar({
  size = 80,
  className,
}: SyncingAssistantAvatarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('relative', className)}
      style={{ width: size + 40, height: size + 40 }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main character container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          y: [-4, 4, -4],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Pulsing glow */}
        <motion.div
          className="absolute rounded-2xl bg-primary/20"
          style={{ width: size + 16, height: size + 16 }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Character SVG */}
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          animate={{
            rotate: [-8, 8, -8],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Body - rounded square */}
          <motion.rect
            x="16"
            y="16"
            rx="8"
            ry="8"
            className="fill-primary stroke-background"
            strokeWidth="2"
            animate={{
              width: [40, 42, 40],
              height: [40, 42, 40],
              x: [16, 15, 16],
              y: [16, 15, 16],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Left eye */}
          <motion.circle
            cx="28"
            cy="32"
            r="3"
            className="fill-background"
            animate={{
              scaleY: [1, 0.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              times: [0, 0.025, 0.05],
              repeatDelay: 2,
            }}
          />

          {/* Right eye */}
          <motion.circle
            cx="44"
            cy="32"
            r="3"
            className="fill-background"
            animate={{
              scaleY: [1, 0.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              times: [0, 0.025, 0.05],
              repeatDelay: 2,
            }}
          />

          {/* Mouth - concentration curve */}
          <motion.path
            className="stroke-background"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={{
              d: [
                'M28 50 Q36 54 44 50',
                'M28 50 Q36 56 44 50',
                'M28 50 Q36 54 44 50',
              ],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Teeth marks */}
          <line
            x1="32"
            y1="50"
            x2="32"
            y2="52"
            className="stroke-background"
            strokeWidth="1.5"
            opacity={0.6}
          />
          <line
            x1="36"
            y1="50"
            x2="36"
            y2="52"
            className="stroke-background"
            strokeWidth="1.5"
            opacity={0.6}
          />
          <line
            x1="40"
            y1="50"
            x2="40"
            y2="52"
            className="stroke-background"
            strokeWidth="1.5"
            opacity={0.6}
          />

          {/* Left hand */}
          <motion.g
            animate={{
              x: [-8, -2, -8],
              y: [-6, -2, -6],
              rotate: [-20, -5, -20],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <path
              d="M16 32 L16 38 L20 42 L24 40 L24 34 L20 30 Z"
              className="fill-primary stroke-background"
              strokeWidth="2"
            />
            <path
              d="M16 34 L14 32 M16 36 L14 34 M18 38 L16 36"
              className="stroke-background"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Right hand */}
          <motion.g
            animate={{
              x: [2, 8, 2],
              y: [-2, -6, -2],
              rotate: [5, 20, 5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <path
              d="M48 32 L48 38 L52 42 L56 40 L56 34 L52 30 Z"
              className="fill-primary stroke-background"
              strokeWidth="2"
            />
            <path
              d="M48 34 L50 32 M48 36 L50 34 M50 38 L52 36"
              className="stroke-background"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Feet */}
          <path
            d="M28 58 Q30 62 32 58"
            className="fill-primary stroke-background"
            strokeWidth="2"
          />
          <path
            d="M40 58 Q42 62 44 58"
            className="fill-primary stroke-background"
            strokeWidth="2"
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
