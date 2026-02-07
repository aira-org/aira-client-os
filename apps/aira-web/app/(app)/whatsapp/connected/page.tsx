'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

// Animated Checkmark SVG Component
function AnimatedCheckmark() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      {/* Circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-foreground"
      >
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isVisible ? { scale: 1, opacity: 1 } : {}}
          transition={{
            type: 'spring',
            damping: 12,
            stiffness: 200,
            delay: 0.2,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="text-foreground"
          >
            <motion.path
              d="M12 24L20 32L36 16"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={isVisible ? { pathLength: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function WhatsAppConnectedPage() {
  const router = useRouter();
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSubtitleVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.push(`${ROUTES.WHATSAPP_GROUP_SELECTION}?source=fresh_connection`);
  };

  return (
    <ScreenLayout
      maxWidth="md"
      className="flex h-full items-center justify-center py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex w-full flex-col items-center gap-10"
      >
        {/* Animated Checkmark */}
        <AnimatedCheckmark />

        {/* Text Container */}
        <div className="flex flex-col items-center gap-2 text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-semibold text-foreground"
          >
            WhatsApp Connected
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: subtitleVisible ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="text-muted-foreground"
          >
            Your WhatsApp is now linked to AiRA
          </motion.p>
        </div>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handleGetStarted}
            className="px-8"
          >
            Get Started !
          </Button>
        </motion.div>
      </motion.div>
    </ScreenLayout>
  );
}
