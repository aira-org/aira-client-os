'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Calendar,
  HardDrive,
  Check,
  Sparkles,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Connector {
  id: string;
  name: string;
  icon: 'whatsapp' | 'mail' | 'calendar' | 'drive';
  isConnected: boolean;
}

interface ConnectorSelectorProps {
  connectors: Connector[];
  selectedIds: string[];
  suggestedIds?: string[];
  onToggle: (id: string) => void;
  onIntegrate?: (id: string) => void;
  className?: string;
}

const ICON_MAP = {
  whatsapp: MessageCircle,
  mail: Mail,
  calendar: Calendar,
  drive: HardDrive,
};

interface ConnectorItemProps {
  connector: Connector;
  isSelected: boolean;
  isSuggested: boolean;
  onToggle: () => void;
  onIntegrate?: () => void;
}

function ConnectorItem({
  connector,
  isSelected,
  isSuggested,
  onToggle,
  onIntegrate,
}: ConnectorItemProps) {
  const Icon = ICON_MAP[connector.icon];
  const showIntegrationPrompt = isSuggested && !connector.isConnected;

  return (
    <div
      className={cn(
        'rounded-xl border bg-card overflow-hidden transition-colors',
        isSelected && 'border-primary',
        isSuggested && !isSelected && 'border-primary/40',
        !isSelected && !isSuggested && 'border-border',
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (connector.isConnected) {
            onToggle();
          }
        }}
        disabled={!connector.isConnected}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            isSelected ? 'bg-primary' : 'bg-background',
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              isSelected ? 'text-primary-foreground' : 'text-foreground',
            )}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[15px] font-medium',
                connector.isConnected
                  ? 'text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {connector.name}
            </span>
            {isSuggested && connector.isConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-md bg-primary/20 px-1.5 py-0.5"
              >
                <Sparkles className="h-2.5 w-2.5 text-primary" />
                <span className="text-[10px] font-semibold text-primary">
                  Suggested
                </span>
              </motion.div>
            )}
          </div>
          {!connector.isConnected && !showIntegrationPrompt && (
            <span className="text-[11px] text-muted-foreground">
              Not connected
            </span>
          )}
        </div>
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background"
            >
              <Check className="h-3 w-3 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showIntegrationPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <button
              type="button"
              onClick={() => onIntegrate?.()}
              className="flex w-full items-center gap-2 border-t border-border bg-primary/5 px-3 py-2.5"
            >
              <Link2 className="h-3.5 w-3.5 text-primary" />
              <span className="flex-1 text-left text-xs font-medium text-primary">
                Would you like to integrate this connector?
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ConnectorSelector({
  connectors,
  selectedIds,
  suggestedIds = [],
  onToggle,
  onIntegrate,
  className,
}: ConnectorSelectorProps) {
  // Sort connectors: suggested first, then connected, then disconnected
  const sortedConnectors = useMemo(() => {
    return [...connectors].sort((a, b) => {
      const aIsSuggested = suggestedIds.includes(a.id);
      const bIsSuggested = suggestedIds.includes(b.id);

      if (aIsSuggested && !bIsSuggested) return -1;
      if (!aIsSuggested && bIsSuggested) return 1;
      if (a.isConnected && !b.isConnected) return -1;
      if (!a.isConnected && b.isConnected) return 1;
      return 0;
    });
  }, [connectors, suggestedIds]);

  const hasSuggestions = suggestedIds.length > 0;

  return (
    <div className={cn('space-y-2', className)}>
      {hasSuggestions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 mb-1"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            Based on your instruction
          </span>
        </motion.div>
      )}
      <div className="space-y-2">
        {sortedConnectors.map((connector, index) => {
          const isSuggested = suggestedIds.includes(connector.id);
          const isSelected = selectedIds.includes(connector.id);

          return (
            <motion.div
              key={connector.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ConnectorItem
                connector={connector}
                isSelected={isSelected}
                isSuggested={isSuggested}
                onToggle={() => onToggle(connector.id)}
                onIntegrate={() => onIntegrate?.(connector.id)}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
