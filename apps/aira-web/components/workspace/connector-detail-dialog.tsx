'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Calendar, HardDrive, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConnectorType = 'whatsapp' | 'email' | 'calendar' | 'drive';

interface ConnectorDetailDialogProps {
  connector: {
    id: string;
    name: string;
    type: ConnectorType;
    isConnected: boolean;
    serviceName?: string;
  };
  userEmail?: string;
  onClose: () => void;
  onModerate?: () => void;
  onDisconnect?: () => void;
  isDisconnecting?: boolean;
}

const connectorIcons = {
  whatsapp: MessageCircle,
  email: Mail,
  calendar: Calendar,
  drive: HardDrive,
};

export function ConnectorDetailDialog({
  connector,
  userEmail,
  onClose,
  onModerate,
  onDisconnect,
  isDisconnecting,
}: ConnectorDetailDialogProps) {
  const Icon = connectorIcons[connector.type];

  const getConnectionInfo = () => {
    if (connector.type === 'whatsapp') {
      return { label: 'Status', value: 'WhatsApp linked' };
    }
    // OAuth connectors (email, calendar, drive) - use user email
    if (userEmail) {
      return { label: 'Connected account', value: userEmail };
    }
    return { label: 'Status', value: 'Connected with Google' };
  };

  const connectionInfo = getConnectionInfo();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        {/* Connection info section */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                {connectionInfo.label}
              </p>
              <p
                className={cn(
                  'truncate text-sm font-medium text-foreground',
                  !userEmail && connector.type !== 'whatsapp' && 'italic',
                )}
              >
                {connectionInfo.value}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-1">
          {connector.type === 'whatsapp' && onModerate && (
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
              onClick={() => {
                onModerate();
                onClose();
              }}
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Moderate
            </button>
          )}
          {onDisconnect && (
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-muted disabled:opacity-50"
              disabled={isDisconnecting}
              onClick={() => {
                onDisconnect();
                // Dialog closes via onSuccess in parent
              }}
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
