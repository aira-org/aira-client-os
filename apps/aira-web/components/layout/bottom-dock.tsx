'use client';

import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Home, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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
        'fixed bottom-10 left-0 right-0 z-50 flex items-center justify-center pb-4 md:pb-6 pointer-events-none',
        className,
      )}
    >
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-lg backdrop-blur-md pointer-events-auto"
      >
        <LayoutGroup id="dock-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  layout 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  
                  <AnimatePresence mode="popLayout" initial={false}>
                    {(isActive || isHovered) && (
                      <motion.span
                        layout
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.15 }}
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
        </LayoutGroup>
      </motion.nav>
    </div>
  );
}