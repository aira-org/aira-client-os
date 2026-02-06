'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LinkCodeDisplayProps {
  code: string;
  onRefresh?: () => void;
  onInfoClick?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function LinkCodeDisplay({
  code,
  onRefresh,
  onInfoClick,
  isRefreshing = false,
  className,
}: LinkCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format code with spaces: 12345678 -> 1234 5678
  const formattedCode = code.slice(0, 4) + ' ' + code.slice(4);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Code Display */}
          <div className="text-center">
            <p className="mb-2 text-sm text-muted-foreground">
              Enter this code in WhatsApp
            </p>
            <motion.div
              key={code}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-mono text-4xl font-bold tracking-[0.2em] text-foreground md:text-5xl"
            >
              {formattedCode}
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
              Refresh
            </Button>

            {onInfoClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onInfoClick}
                className="h-8 w-8"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
