'use client';

import React, {  useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Expanded country list
const COUNTRIES = [
  { code: '+1', name: 'US', flag: '🇺🇸' },
  { code: '+91', name: 'IN', flag: '🇮🇳' },
  { code: '+44', name: 'GB', flag: '🇬🇧' },
  { code: '+61', name: 'AU', flag: '🇦🇺' },
  { code: '+49', name: 'DE', flag: '🇩🇪' },
  { code: '+33', name: 'FR', flag: '🇫🇷' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  // Extract code and number from the existing value
  // We assume the value is stored as "+1234567890"
  const selectedCountry = useMemo(() => {
    return COUNTRIES.find(c => value.startsWith(c.code)) || COUNTRIES[0];
  }, [value]);

  const phoneNumber = value.replace(selectedCountry?.code || '', '');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNumber = e.target.value.replace(/\D/g, '');
    onChange(`${selectedCountry?.code}${rawNumber}`);
  };

  const handleCountryChange = (newCode: string) => {
    const rawNumber = value.replace(selectedCountry?.code || '', '');
    onChange(`${newCode}${rawNumber}`);
  };

  return (
    <div className={cn('flex gap-2 items-center justify-center', className)}>
      <Select value={selectedCountry?.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-25 text-lg h-14! bg-card! rounded-xl!">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="555-0000"
          className="h-14 text-lg transition-all"
        />
      </div>
    </div>
  );
}