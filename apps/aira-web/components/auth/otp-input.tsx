'use client';

import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  className?: string;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [shake, setShake] = useState(false);

  // Trigger shake animation on error (defer setState to avoid synchronous setState in effect)
  useEffect(() => {
    if (error) {
      const startId = setTimeout(() => setShake(true), 0);
      const endId = setTimeout(() => setShake(false), 500);
      return () => {
        clearTimeout(startId);
        clearTimeout(endId);
      };
    }
  }, [error]);

  const handleChange = (index: number, char: string) => {
    // Only allow digits
    if (char && !/^\d$/.test(char)) return;

    const newValue = value.split('');
    newValue[index] = char;
    const result = newValue.join('').slice(0, length);
    onChange(result);

    // Auto-advance to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are entered
    if (result.length === length && onComplete) {
      onComplete(result);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newValue = pastedData.slice(0, length);
    onChange(newValue);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(newValue.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={cn('flex justify-center gap-2 md:gap-3', className)}
    >
      {Array.from({ length }, (_, index) => (
        <motion.input
          key={index}
          ref={el => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'h-14 w-11 rounded-xl border bg-card text-center text-xl font-semibold text-foreground outline-none transition-all md:h-16 md:w-14 md:text-2xl',
            value[index]
              ? 'border-primary'
              : error
                ? 'border-destructive'
                : 'border-border',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
          )}
        />
      ))}
    </motion.div>
  );
}
