'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutGrid, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

interface BottomDockProps {
  className?: string;
}

export function BottomDock({ className }: BottomDockProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab = searchParams.get('tab');

  // Show + only on workspace rules
  const showPlus =
    pathname === ROUTES.WORKSPACE &&
    (tab === 'rules' || tab === null);

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={cn(
        'fixed bottom-0 z-50  w-full flex justify-center',
        className,
      )}
    >
      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="relative flex items-center gap-10 rounded-3xl border border-border w-full  justify-center bg-card px-8 py-3  backdrop-blur-xl shadow-xl"
      >
        {/* Home */}
        <Link href={ROUTES.HUB} className="flex flex-col items-center gap-1">
          <Home
            className={cn(
              'h-6 w-6',
              isActive(ROUTES.HUB)
                ? 'text-white'
                : 'text-muted-foreground',
            )}
          />
          <span className="text-[11px] text-muted-foreground">Home</span>
          {isActive(ROUTES.HUB) && (
            <span className="mt-1 h-[3px] w-4 rounded-full bg-white" />
          )}
        </Link>

        {/* Center Action (+) */}
        <AnimatePresence>
          {showPlus && (
            <motion.button
              key="plus-button"
              initial={{ y: 20, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              onClick={() => router.push(ROUTES.RULES_NEW)}
              className="relative -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg active:scale-95"
            >
              <Plus className="h-8 w-8" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Workspace */}
        <Link
          href={ROUTES.WORKSPACE}
          className="flex flex-col items-center gap-1"
        >
          <LayoutGrid
            className={cn(
              'h-6 w-6',
              isActive(ROUTES.WORKSPACE)
                ? 'text-white'
                : 'text-muted-foreground',
            )}
          />
          <span className="text-[11px] text-muted-foreground">
            Workspace
          </span>
          {isActive(ROUTES.WORKSPACE) && (
            <span className="mt-1 h-[3px] w-4 rounded-full bg-white" />
          )}
        </Link>
      </motion.nav>
    </div>
  );
}
