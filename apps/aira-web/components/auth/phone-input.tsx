'use client';
import * as React from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Simple country detection based on phone number prefix
const detectCountry = (
  phone: string,
): { code: string; name: string } | null => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length >= 4) {
    return { code: '+91', name: 'India' };
  }
  if (cleaned.startsWith('1') && cleaned.length >= 4) {
    return { code: '+1', name: 'USA' };
  }
  if (cleaned.startsWith('44') && cleaned.length >= 4) {
    return { code: '+44', name: 'UK' };
  }
  if (cleaned.startsWith('61') && cleaned.length >= 4) {
    return { code: '+61', name: 'Australia' };
  }
  return null;
};

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const country = useMemo(() => detectCountry(value), [value]);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and basic formatting
    const newValue = e.target.value.replace(/[^\d+\-\s()]/g, '');
    onChange(newValue);
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        type="tel"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="+1 (555) 000-0000"
        className={cn(
          'h-14 text-lg transition-all',
          isFocused && 'ring-2 ring-primary',
        )}
      />

      {/* Country Badge */}
      <AnimatePresence>
        {country && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-3 left-4"
          >
            <Badge variant="secondary" className="text-xs">
              {country.code} {country.name}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
