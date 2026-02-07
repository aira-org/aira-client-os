'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Sun, Monitor, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const THEMES: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: theme is only known on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = (mounted ? theme ?? 'system' : 'system') as Theme;
  const isDark = mounted && resolvedTheme === 'dark';

  const handleMobileToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <>
      {/* Mobile: single icon toggles light ↔ dark (adapts to system) */}
      <div
        className={cn(
          'inline-flex md:hidden',
          'rounded-sm bg-muted/80 p-1 shadow-inner',
          className,
        )}
      >
        <button
          type="button"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
          onClick={handleMobileToggle}
          className="relative flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isDark ? (
            <Sun className="h-4 w-4" strokeWidth={2} />
          ) : (
            <Moon className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Desktop: full Light / System / Dark pill */}
      <div
        role="radiogroup"
        aria-label="Theme"
        className={cn(
          'hidden md:inline-flex items-center rounded-xl bg-muted/80 p-1 shadow-inner',
          className,
        )}
      >
        {THEMES.map(({ value, icon: Icon, label }) => {
          const isActive = activeTheme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mounted ? isActive : value === 'system'}
              aria-label={label}
              title={label}
              onClick={() => setTheme(value)}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isActive && 'text-foreground',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="theme-switcher-pill"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  className="absolute inset-0 rounded-lg bg-background shadow-sm"
                />
              )}
              <span className="relative z-10">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
