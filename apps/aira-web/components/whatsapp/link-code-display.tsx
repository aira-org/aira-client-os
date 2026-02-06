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

  // Format code into two chips: 12345678 -> [1234, 5678]
  const formattedCode = code ? [code.slice(0, 4), code.slice(4)] : [];

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
              className="flex items-center justify-center gap-2 font-mono text-3xl font-bold text-foreground md:text-4xl"
            >
              {formattedCode.length > 0 ? (
                formattedCode.map(part => (
                  <span
                    key={part}
                    className="inline-flex min-w-[4.5ch] justify-center rounded-lg bg-muted px-2 py-1 tracking-[0.12em] md:px-3"
                  >
                    {part}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 w-full sm:w-auto"
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
              className="gap-2 w-full sm:w-auto"
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
