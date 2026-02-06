'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export type IntervalType =
  | 'none'
  | 'once'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

interface Interval {
  id: IntervalType;
  label: string;
}

const INTERVALS: Interval[] = [
  { id: 'once', label: 'Once' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'yearly', label: 'Yearly' },
];

interface IntervalChipProps {
  interval: Interval;
  isSelected: boolean;
  onPress: () => void;
}

function IntervalChip({ interval, isSelected, onPress }: IntervalChipProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors shrink-0',
        isSelected
          ? 'bg-primary border-primary'
          : 'bg-background border-border hover:border-primary/50',
      )}
    >
      <span
        className={cn(
          'text-xs font-semibold',
          isSelected ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {interval.label}
      </span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <Check
            className={cn(
              'h-3 w-3',
              isSelected ? 'text-primary-foreground' : 'text-foreground',
            )}
            strokeWidth={3}
          />
        </motion.div>
      )}
    </button>
  );
}

interface ScheduleSelectorProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  time: string;
  onTimeChange: (time: string) => void;
  interval: IntervalType;
  onIntervalChange: (interval: IntervalType) => void;
  className?: string;
}

export function ScheduleSelector({
  isEnabled,
  onToggle,
  time,
  onTimeChange,
  interval,
  onIntervalChange,
  className,
}: ScheduleSelectorProps) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-card p-4', className)}
    >
      {/* Toggle Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
            <Clock className="h-[18px] w-[18px] text-primary" />
          </div>
          <div>
            <span className="text-[15px] font-semibold text-foreground">
              Schedule Trigger
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEnabled ? 'Run at specific times' : 'Runs in real-time'}
            </p>
          </div>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Time Picker Section */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Start Time
                  </span>
                </div>
                <Input
                  type="time"
                  value={time}
                  onChange={e => onTimeChange(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Interval Section */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Repeat Interval
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTERVALS.map(item => (
                    <IntervalChip
                      key={item.id}
                      interval={item}
                      isSelected={interval === item.id}
                      onPress={() =>
                        onIntervalChange(
                          interval === item.id ? 'none' : item.id,
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
