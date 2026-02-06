'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChevronDown, Search } from 'lucide-react';
import { getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';

interface Country {
  code: CountryCode;
  dialCode: string;
  name: string;
  flag: string;
}

// Convert country code to flag emoji (e.g., 'US' -> '🇺🇸')
const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Country names from Intl API
const getCountryName = (code: CountryCode): string => {
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(code) || code;
  } catch {
    return code;
  }
};

// Generate all countries dynamically from libphonenumber-js
const COUNTRIES: Country[] = getCountries()
  .map(code => ({
    code,
    dialCode: `+${getCountryCallingCode(code)}`,
    name: getCountryName(code),
    flag: getFlagEmoji(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const [mounted, setMounted] = useState(false);
  // Find India as default, fallback to first country
  const defaultCountry = COUNTRIES.find(c => c.code === 'IN') || COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const query = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      country =>
        country.name.toLowerCase().includes(query) ||
        country.dialCode.includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Render simple input on server to match client initial render
  if (!mounted) {
    return (
      <div className={cn('relative', className)}>
        <Input
          type="tel"
          placeholder="Enter phone number"
          className="h-14 text-lg"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    );
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    // Update the phone value with new country code
    const phoneWithoutCode = value.replace(/^\+?\d+\s*/, '');
    onChange(`${country.dialCode} ${phoneWithoutCode}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d\s]/g, '');
    onChange(`${selectedCountry.dialCode} ${newValue}`);
  };

  // Extract phone number without country code for display
  const phoneWithoutCode = value.replace(selectedCountry.dialCode, '').trim();

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div
        className={cn(
          'flex items-center rounded-xl border border-border bg-card transition-all',
          isFocused && 'ring-2 ring-primary border-primary'
        )}
      >
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center gap-2 px-4 py-4 border-r border-border hover:bg-muted/50 transition-colors rounded-l-xl whitespace-nowrap"
        >
          <span className="text-sm font-medium text-foreground leading-none self-center">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-foreground leading-none">{selectedCountry.dialCode}</span>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
        </button>

        {/* Phone Number Input */}
        <Input
          type="tel"
          value={phoneWithoutCode}
          onChange={handlePhoneChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter phone number"
          className="h-14 text-lg border-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Country Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left',
                      selectedCountry.code === country.code && 'bg-primary/10'
                    )}
                  >
                    <span className="text-xl w-8 flex-shrink-0">{country.flag}</span>
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{country.name}</span>
                    <span className="text-sm text-muted-foreground w-16 text-right flex-shrink-0">{country.dialCode}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No countries found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

