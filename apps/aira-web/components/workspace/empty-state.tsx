'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ExampleRulesSection } from './example-rules-section';

interface EmptyStateProps {
  type: 'rules' | 'connectors';
  className?: string;
}

export function EmptyState({ type, className }: EmptyStateProps) {
  const content = {
    rules: {
      icon: LayoutGrid,
      title: 'No rules yet',
      description: 'Create your first automation rule to get started',
      action: 'Create Rule',
      href: ROUTES.RULES_NEW,
    },
    connectors: {
      icon: LayoutGrid,
      title: 'No connectors',
      description: 'Connect your first service to enable automations',
      action: 'View Connectors',
      href: ROUTES.WORKSPACE,
    },
  };

  const { icon: Icon, title, description, action, href } = content[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      <div className="mb-4 rounded-2xl bg-card p-6">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">{description}</p>
      <Link href={href}>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {action}
        </Button>
      </Link>
      {type === 'rules' && (
        <div className="mt-10 w-full max-w-md px-4">
          <ExampleRulesSection />
        </div>
      )}
    </motion.div>
  );
}
