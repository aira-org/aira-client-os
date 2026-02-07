'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, Check, Hash } from 'lucide-react';
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

const SPAN_INTERVAL_PRESETS = [15, 30, 60, 120, 180] as const; // minutes

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
  /** Start time (e.g. "09:00") */
  time: string;
  onTimeChange: (time: string) => void;
  interval: IntervalType;
  onIntervalChange: (interval: IntervalType) => void;
  /** End time for "once" (time range) or for "daily" etc. (time span). Optional. */
  timeEnd?: string;
  onTimeEndChange?: (time: string) => void;
  /** For "once": how many times to run within the time range (1–20). */
  runCount?: number;
  onRunCountChange?: (value: number) => void;
  /** For "daily" etc.: repeat every X minutes within the time span. Optional. */
  intervalMinutes?: number;
  onIntervalMinutesChange?: (value: number) => void;
  className?: string;
}

export function ScheduleSelector({
  isEnabled,
  onToggle,
  time,
  onTimeChange,
  interval,
  onIntervalChange,
  timeEnd = '17:00',
  onTimeEndChange,
  runCount = 1,
  onRunCountChange,
  intervalMinutes = 0,
  onIntervalMinutesChange,
  className,
}: ScheduleSelectorProps) {
  const isOnce = interval === 'once';
  const isRepeating = interval !== 'none' && interval !== 'once';

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
            <div className="pt-3 space-y-3">
              {/* Repeat Interval Chips */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Repeat
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

              {/* ONCE: Between start and end time + how many times */}
              {isOnce && (
                <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Between what time
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={e => onTimeChange(e.target.value)}
                      className="h-8 w-[100px] text-sm"
                      aria-label="Start time"
                    />
                    <span className="text-[11px] text-muted-foreground">and</span>
                    <Input
                      type="time"
                      value={timeEnd}
                      onChange={e => onTimeEndChange?.(e.target.value)}
                      className="h-8 w-[100px] text-sm"
                      aria-label="End time"
                    />
                  </div>
                  {onRunCountChange && (
                    <>
                      <div className="flex items-center gap-1.5 mt-3 mb-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          How many times
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={runCount}
                          onChange={e =>
                            onRunCountChange(
                              Math.max(
                                1,
                                Math.min(20, Number(e.target.value) || 1),
                              ),
                            )
                          }
                          className="h-8 w-14 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          time(s) within this window
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* DAILY / WEEKLY / etc.: Start time, optional time span, optional interval within span */}
              {isRepeating && (
                <>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Start time
                      </span>
                    </div>
                    <Input
                      type="time"
                      value={time}
                      onChange={e => onTimeChange(e.target.value)}
                      className="h-8 w-[100px] text-sm"
                    />
                  </div>
                  {onTimeEndChange && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Time span (optional)
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-1.5">
                        End time each day — leave empty for single run at start
                        time
                      </p>
                      <Input
                        type="time"
                        value={timeEnd}
                        onChange={e => onTimeEndChange(e.target.value)}
                        className="h-8 w-[100px] text-sm"
                        aria-label="End time (time span)"
                      />
                    </div>
                  )}
                  {onIntervalMinutesChange && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <RefreshCw className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Repeat within span (optional)
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-1.5">
                        Every X minutes between start and end time
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {SPAN_INTERVAL_PRESETS.map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              onIntervalMinutesChange(
                                intervalMinutes === n ? 0 : n,
                              )
                            }
                            className={cn(
                              'flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors',
                              intervalMinutes === n
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-background border-border hover:border-primary/50 text-foreground',
                            )}
                          >
                            {n}m
                          </button>
                        ))}
                        <span className="text-[11px] text-muted-foreground">
                          or once at start
                        </span>
                      </div>
                      {intervalMinutes > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <Input
                            type="number"
                            min={1}
                            max={1440}
                            value={intervalMinutes}
                            onChange={e =>
                              onIntervalMinutesChange(
                                Math.max(
                                  0,
                                  Math.min(
                                    1440,
                                    Number(e.target.value) || 0,
                                  ),
                                ),
                              )
                            }
                            className="h-8 w-16 text-sm"
                          />
                          <span className="text-[11px] text-muted-foreground">
                            minutes
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
