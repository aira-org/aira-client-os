'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, icon, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2 mb-3 mt-4', className)}>
      {icon}
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
  );
}
