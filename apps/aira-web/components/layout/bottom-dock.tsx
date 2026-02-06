'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

interface BottomDockProps {
  className?: string;
}

const navItems = [
  {
    label: 'Home',
    href: ROUTES.HUB,
    icon: Home,
  },
  {
    label: 'Workspace',
    href: ROUTES.WORKSPACE,
    icon: LayoutGrid,
  },
];

export function BottomDock({ className }: BottomDockProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'fixed bottom-10 left-0 right-0 z-50 flex items-center justify-center pb-4 md:pb-6',
        className,
      )}
    >
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-lg backdrop-blur-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
