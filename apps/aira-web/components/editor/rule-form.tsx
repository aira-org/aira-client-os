'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Check,
  Trash2,
  FileText,
  HardDrive,
  Users,
  Clock,
  Play,
} from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { Textarea } from '@/components/ui/textarea';
import { SectionHeader } from './section-header';
import { ConnectorSelector, type Connector } from './connector-selector';
import { GroupPickerCard } from './group-picker-card';
import { ScheduleSelector, type IntervalType } from './schedule-selector';
import { GroupPickerDialog } from './group-picker-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getSuggestedConnectorIds,
  detectKeywords,
  INTERVAL_TO_DAYS,
  DAYS_TO_INTERVAL,
  buildTriggerTimeUTC,
  parseTriggerTimeToLocal,
} from '@/lib/rule-utils';
import type { RuleFormGroup } from '@/hooks/use-rule-form-data';

export interface RuleFormRule {
  rule_id: string;
  raw_text: string;
  w_id: string[];
  status: 'active' | 'inactive';
  trigger_time?: string;
  interval?: number;
}

interface RuleFormBaseProps {
  mode: 'create' | 'edit';
  connectors: Connector[];
  groups: RuleFormGroup[];
  onSave: (data: RuleFormSubmitData) => void;
  onBack: () => void;
  isSaving: boolean;
  saveLabel: string;
  headerTitle: string;
  /** Only for create mode */
  initialRawText?: string;
  initialSelectedGroups?: string[];
  suggestionId?: string | null;
  /** Only for edit mode */
  rule?: RuleFormRule;
  onDelete?: () => void;
  isDeleting?: boolean;
  /** Only for create mode - integrate connector flow */
  onIntegrate?: (connectorId: string) => void;
  /** Only for create mode - run rule once end-to-end before creating */
  onRunOnce?: (data: RuleFormSubmitData) => void;
  isRunningOnce?: boolean;
  runOnceResult?: {
    success: boolean;
    summary?: string;
    messages_scanned?: number;
    groups_processed?: Array<{ w_id: string; chat_name: string; message_count: number }>;
    actions?: Array<{ type: string; description: string; target?: string; preview?: string }>;
    error?: string;
  } | null;
  onRunOnceResultClose?: () => void;
}

export interface RuleFormSubmitData {
  w_id: string[];
  raw_text: string;
  trigger_time?: string;
  interval?: number;
  status?: 'active' | 'inactive';
  rule_id?: string;
  suggestion_id?: string;
}

export function RuleForm({
  mode,
  connectors,
  groups,
  onSave,
  onBack,
  isSaving,
  saveLabel,
  headerTitle,
  initialRawText = '',
  initialSelectedGroups = [],
  suggestionId,
  rule,
  onDelete,
  isDeleting = false,
  onIntegrate,
  onRunOnce,
  isRunningOnce = false,
  runOnceResult,
  onRunOnceResultClose,
}: RuleFormBaseProps) {
  const initialHasSchedule =
    mode === 'edit' &&
    rule &&
    rule.trigger_time &&
    rule.trigger_time !== 'Real-time';

  const [rawText, setRawText] = useState(
    mode === 'edit' && rule ? rule.raw_text : initialRawText,
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    mode === 'edit' && rule?.w_id?.length ? rule.w_id : initialSelectedGroups,
  );
  const [scheduleEnabled, setScheduleEnabled] = useState(!!initialHasSchedule);
  const [scheduleTime, setScheduleTime] = useState(
    initialHasSchedule && rule
      ? parseTriggerTimeToLocal(rule.trigger_time)
      : '09:00',
  );
  const [scheduleInterval, setScheduleInterval] = useState<IntervalType>(
    initialHasSchedule && rule
      ? (DAYS_TO_INTERVAL[rule.interval ?? 0] ?? 'daily')
      : 'none',
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const suggestedConnectorIds = useMemo(
    () => getSuggestedConnectorIds(rawText),
    [rawText],
  );
  const matchedKeywords = useMemo(() => detectKeywords(rawText), [rawText]);

  const selectedConnectors = useMemo(() => {
    const connectedIds = connectors.filter(c => c.isConnected).map(c => c.id);
    return suggestedConnectorIds.filter(id => connectedIds.includes(id));
  }, [suggestedConnectorIds, connectors]);

  const showGroupSelector = selectedConnectors.includes('whatsapp');

  const filteredGroups = useMemo(() => {
    if (!groupSearchQuery.trim()) return groups;
    const q = groupSearchQuery.trim().toLowerCase();
    return groups.filter(
      g => g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q),
    );
  }, [groups, groupSearchQuery]);

  const isLoading = isSaving || isDeleting || isRunningOnce;
  const canRunOnce =
    rawText.trim().length > 0 &&
    (showGroupSelector ? selectedGroups.length > 0 : true) &&
    (scheduleEnabled ? scheduleInterval !== 'none' : true) &&
    !isLoading;
  const canSave =
    rawText.trim().length > 0 &&
    (showGroupSelector ? selectedGroups.length > 0 : true) &&
    (scheduleEnabled ? scheduleInterval !== 'none' : true) &&
    !isLoading;

  const handleConnectorToggle = useCallback((_id: string) => {
    // No-op: connected services that are suggested are automatically selected
  }, []);

  const handleSave = useCallback(() => {
    if (!canSave) return;

    const data: RuleFormSubmitData = {
      w_id: selectedGroups,
      raw_text: rawText,
      status: mode === 'edit' && rule ? rule.status : 'active',
    };

    if (scheduleEnabled) {
      data.trigger_time = buildTriggerTimeUTC(scheduleTime);
      data.interval = INTERVAL_TO_DAYS[scheduleInterval];
    }

    if (mode === 'edit' && rule) {
      data.rule_id = rule.rule_id;
    }

    if (mode === 'create' && suggestionId) {
      data.suggestion_id = suggestionId;
    }

    onSave(data);
  }, [
    canSave,
    rawText,
    selectedGroups,
    scheduleEnabled,
    scheduleTime,
    scheduleInterval,
    mode,
    rule,
    suggestionId,
    onSave,
  ]);

  const handleRunOnce = useCallback(() => {
    if (!canRunOnce || !onRunOnce) return;

    const data: RuleFormSubmitData = {
      w_id: selectedGroups,
      raw_text: rawText,
      status: 'active',
    };

    if (scheduleEnabled) {
      data.trigger_time = buildTriggerTimeUTC(scheduleTime);
      data.interval = INTERVAL_TO_DAYS[scheduleInterval];
    }

    if (suggestionId) {
      data.suggestion_id = suggestionId;
    }

    onRunOnce(data);
  }, [
    canRunOnce,
    rawText,
    selectedGroups,
    scheduleEnabled,
    scheduleTime,
    scheduleInterval,
    suggestionId,
    onRunOnce,
  ]);

  const handleDelete = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  return (
    <ScreenLayout maxWidth="lg" className="relative min-h-screen pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {headerTitle}
          </h1>
          {mode === 'edit' && onDelete ? (
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
          {/* Rule Instruction */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <SectionHeader
              title="Rule Instruction"
              icon={<FileText className="h-4.5 w-4.5 text-primary" />}
            />
            <div
              className={cn(
                'rounded-2xl bg-card p-3',
                mode === 'create' &&
                  'border border-border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0',
              )}
            >
              <Textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Describe what this rule should do..."
                className={cn(
                  'rule-instruction-input min-h-[100px] resize-none border-0 bg-transparent p-0 text-[15px] focus-visible:outline-none focus-visible:ring-0',
                  mode === 'create' ? 'p-3' : 'p-4',
                )}
              />
              {matchedKeywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                  {matchedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-lg border border-primary/40 bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Connected Services */}
          {suggestedConnectorIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SectionHeader
                title="Connected Services"
                icon={<HardDrive className="h-4.5 w-4.5 text-primary" />}
              />
              <ConnectorSelector
                connectors={connectors.filter(c =>
                  suggestedConnectorIds.includes(c.id),
                )}
                selectedIds={selectedConnectors}
                suggestedIds={suggestedConnectorIds}
                onToggle={handleConnectorToggle}
                onIntegrate={onIntegrate}
              />
            </motion.div>
          )}

          {/* Apply to Groups */}
          {showGroupSelector && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SectionHeader
                title="Apply to Groups"
                icon={<Users className="h-4.5 w-4.5 text-primary" />}
              />
              <GroupPickerCard
                selectedCount={selectedGroups.length}
                onClick={() => setShowGroupPicker(true)}
              />
            </motion.div>
          )}

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SectionHeader
              title="Trigger Schedule"
              icon={<Clock className="h-4.5 w-4.5 text-primary" />}
            />
            <ScheduleSelector
              isEnabled={scheduleEnabled}
              onToggle={setScheduleEnabled}
              time={scheduleTime}
              onTimeChange={setScheduleTime}
              interval={scheduleInterval}
              onIntervalChange={setScheduleInterval}
            />
          </motion.div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 px-2 bg-background">
          <div className="mx-auto max-w-lg px-5 py-4 flex flex-col gap-3">
            {mode === 'create' && onRunOnce && (
              <Button
                variant="outline"
                onClick={handleRunOnce}
                disabled={!canRunOnce}
                className={cn(
                  'w-full rounded-2xl py-3 text-base font-medium border-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60',
                  !canRunOnce && 'opacity-50',
                )}
              >
                <Play className="mr-2 h-4 w-4" />
                {isRunningOnce ? 'Running rule...' : 'Run once (see how it works)'}
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'w-full rounded-2xl py-4 text-base font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none',
                !canSave && 'opacity-50',
              )}
            >
              <Check className="mr-2 h-5 w-5" />
              {saveLabel}
            </Button>
          </div>
        </div>
      </motion.div>

      <GroupPickerDialog
        open={showGroupPicker}
        onOpenChange={setShowGroupPicker}
        groups={filteredGroups}
        selected={selectedGroups}
        onSelectionChange={setSelectedGroups}
        searchQuery={groupSearchQuery}
        onSearchChange={setGroupSearchQuery}
      />

      {runOnceResult && onRunOnceResultClose && (
        <Dialog open={!!runOnceResult} onOpenChange={open => !open && onRunOnceResultClose()}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Run Once Result
              </DialogTitle>
              <DialogDescription>
                {runOnceResult.success
                  ? 'Your rule ran once and sent messages. Here\'s what happened:'
                  : runOnceResult.error
                    ? runOnceResult.error
                    : 'The run encountered an issue. You can still create the rule.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {runOnceResult.success && runOnceResult.summary && (
                <p className="text-sm text-foreground leading-relaxed">
                  {runOnceResult.summary}
                </p>
              )}
              {runOnceResult.success && runOnceResult.messages_scanned != null && (
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="font-medium text-foreground">
                    {runOnceResult.messages_scanned} message{runOnceResult.messages_scanned !== 1 ? 's' : ''} scanned
                  </span>
                </div>
              )}
              {runOnceResult.success && runOnceResult.groups_processed && runOnceResult.groups_processed.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Groups processed
                  </p>
                  <ul className="space-y-1.5">
                    {runOnceResult.groups_processed.map((g, i) => (
                      <li
                        key={i}
                        className="flex justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span className="text-foreground">{g.chat_name}</span>
                        <span className="text-muted-foreground">{g.message_count} messages</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {runOnceResult.success && runOnceResult.actions && runOnceResult.actions.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    What was sent
                  </p>
                  <ul className="space-y-2">
                    {runOnceResult.actions.map((action, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-border bg-card p-3 text-sm"
                      >
                        <p className="font-medium text-foreground">{action.description}</p>
                        {action.target && (
                          <p className="mt-1 text-xs text-muted-foreground">→ {action.target}</p>
                        )}
                        {action.preview && (
                          <p className="mt-2 rounded bg-muted/50 px-2 py-1.5 font-mono text-xs text-foreground">
                            {action.preview}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {runOnceResult.success && !runOnceResult.summary && !runOnceResult.actions?.length && !runOnceResult.groups_processed?.length && (
                <p className="text-sm text-muted-foreground">
                  Rule ran successfully. No matching messages to act on. Create the rule to keep it active.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={onRunOnceResultClose}>Got it</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {mode === 'edit' && onDelete && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Rule</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this rule? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ScreenLayout>
  );
}
