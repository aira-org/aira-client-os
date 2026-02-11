'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { UserMenu } from '@/components/hub/user-menu';
import { useUser } from '@repo/core';

interface SidebarProps {
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

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const { data: user } = useUser();
  const userName = user?.f_n || 'User';

  return (
    <nav
      className={cn(
        'flex h-full flex-col border-border bg-card/10',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fixed Header - 10% */}
      <motion.div
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="h-[10%] shrink-0 px-3 py-3 flex items-center"
      >
        <div className="px-2">
          <div className="text-sm font-semibold tracking-tight text-foreground">
            AiRA
          </div>
          <div className="text-xs text-muted-foreground">Dashboard</div>
        </div>
      </motion.div>

      {/* Scrollable Nav Items - 80% */}
      <div className="h-[80%] overflow-y-auto px-3">
        <motion.div
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150, delay: 0.1 }}
          className="flex flex-col gap-2 py-2"
        >
          {navItems.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.HUB && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="block w-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="whitespace-nowrap text-sm font-medium flex-1">
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* Fixed Footer - 10% */}
      <motion.div
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150, delay: 0.2 }}
        className="h-[10%] shrink-0 border-t border-border px-3 py-4 flex items-center"
      >
        <UserMenu userName={userName} />
      </motion.div>
    </nav>
  );
}
