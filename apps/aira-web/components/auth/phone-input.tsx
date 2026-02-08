'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { countries, type Country } from '@/lib/countries';

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryChange: (code: string) => void;
  onPhoneChange: (number: string) => void;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  className,
  disabled,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return countries.filter(
      country =>
        country.name.toLowerCase().includes(query) ||
        country.dial_code.includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get current country object
  const selectedCountry = useMemo(
    () => countries.find(c => c.dial_code === countryCode) || countries[0],
    [countryCode]
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d\s-]/g, '');
    onPhoneChange(value);
  };

  return (
    <div className={cn('relative space-y-2', className)}>
      <div className={cn(
        "flex h-14 items-center rounded-md border border-input bg-transparent transition-all duration-200",
        isFocused && "ring-2 ring-primary border-transparent",
        "focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
      )}>
        {/* Country Selector */}
        <div className="relative h-full" ref={dropdownRef}>
          <Button
            type="button"
            variant="ghost"
            className="h-full rounded-l-md rounded-r-none border-r border-input px-4 font-normal hover:bg-transparent"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className="mr-2 text-xl">{selectedCountry?.flag}</span>
            <span className="mr-1 text-sm font-medium">{selectedCountry?.dial_code}</span>
            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", isOpen && "rotate-180")} />
          </Button>

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-md border bg-popover shadow-lg ring-1 ring-black/5"
              >
                <div className="border-b p-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 border-0 bg-secondary/50 pl-9 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-1">
                    {filteredCountries.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No countries found
                      </div>
                    ) : (
                      filteredCountries.map((country) => (
                        <Button
                          key={`${country.code}-${country.dial_code}`}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start rounded-sm px-3 py-2 font-normal",
                            selectedCountry?.code === country.code && "bg-secondary"
                          )}
                          onClick={() => {
                            onCountryChange(country.dial_code);
                            setIsOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <span className="mr-2 text-xl">{country.flag}</span>
                          <span className="flex-1 text-left truncate">{country.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">{country.dial_code}</span>
                          {selectedCountry?.code === country.code && (
                            <Check className="ml-2 h-4 w-4 text-primary" />
                          )}
                        </Button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phone Number Input */}
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Phone number"
          className="h-full flex-1 border-0 bg-transparent px-4 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
