'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Check,
  Trash2,
  FileText,
  HardDrive,
  Users,
  Clock,
  Search,
} from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { Textarea } from '@/components/ui/textarea';
import {
  SectionHeader,
  ConnectorSelector,
  GroupPickerCard,
  ScheduleSelector,
  GroupSelector,
  type Connector,
  type IntervalType,
} from '@/components/editor';
import { MOCK_RULES, ROUTES } from '@/lib/constants';
import {
  useUpdateRule,
  useDeleteRule,
  useWahaGroups,
  useConnectors,
} from '@repo/core';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const INTERVAL_TO_DAYS: Record<IntervalType, number> = {
  none: 0,
  once: 0,
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

const DAYS_TO_INTERVAL: Record<number, IntervalType> = {
  0: 'none',
  1: 'daily',
  7: 'weekly',
  30: 'monthly',
  90: 'quarterly',
  365: 'yearly',
};

const buildTriggerTimeUTC = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  return now.toISOString();
};

const parseTriggerTimeToLocal = (utcString?: string): string => {
  if (!utcString || utcString === 'Real-time') {
    return '09:00';
  }
  const date = new Date(utcString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Simple keyword detection for services
const SERVICE_KEYWORDS: Record<string, string[]> = {
  google_drive: ['drive', 'file', 'document', 'folder', 'upload', 'download'],
  google_calendar: [
    'calendar',
    'event',
    'meeting',
    'schedule',
    'appointment',
    'reminder',
  ],
  email_scope: ['email', 'mail', 'send', 'inbox', 'message'],
  whatsapp: ['whatsapp', 'group', 'chat', 'message'],
};

function getSuggestedConnectorIds(text: string): string[] {
  const lowerText = text.toLowerCase();
  const suggested: string[] = [];

  Object.entries(SERVICE_KEYWORDS).forEach(([serviceId, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      suggested.push(serviceId);
    }
  });

  // Always include whatsapp by default
  if (!suggested.includes('whatsapp')) {
    suggested.push('whatsapp');
  }

  return suggested;
}

function detectKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const matched: string[] = [];

  Object.values(SERVICE_KEYWORDS)
    .flat()
    .forEach(keyword => {
      if (lowerText.includes(keyword) && !matched.includes(keyword)) {
        matched.push(keyword);
      }
    });

  return matched.slice(0, 5);
}

interface EditRuleFormProps {
  rule: {
    rule_id: string;
    raw_text: string;
    w_id: string[];
    status: 'active' | 'inactive';
    trigger_time?: string;
    interval?: number;
  };
  connectors: Connector[];
  groups: Array<{ id: string; name: string; rulesCount: number }>;
}

function EditRuleForm({ rule, connectors, groups }: EditRuleFormProps) {
  const router = useRouter();

  // Mutations
  const { mutate: updateRule, isPending: isUpdating } = useUpdateRule();
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteRule();

  // Compute initial values from rule
  const initialHasSchedule =
    rule.trigger_time && rule.trigger_time !== 'Real-time';

  // Form state - initialized directly from rule props
  const [rawText, setRawText] = useState(rule.raw_text);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    rule.w_id?.length ? rule.w_id : [],
  );
  const [scheduleEnabled, setScheduleEnabled] = useState(!!initialHasSchedule);
  const [scheduleTime, setScheduleTime] = useState(
    initialHasSchedule ? parseTriggerTimeToLocal(rule.trigger_time) : '09:00',
  );
  const [scheduleInterval, setScheduleInterval] = useState<IntervalType>(
    initialHasSchedule
      ? (DAYS_TO_INTERVAL[rule.interval ?? 0] ?? 'daily')
      : 'none',
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  // Derived state
  const suggestedConnectorIds = useMemo(
    () => getSuggestedConnectorIds(rawText),
    [rawText],
  );
  const matchedKeywords = useMemo(() => detectKeywords(rawText), [rawText]);

  // Auto-select connected services that are suggested
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

  const isLoading = isUpdating || isDeleting;
  const canSave =
    rawText.trim().length > 0 &&
    (showGroupSelector ? selectedGroups.length > 0 : true) &&
    (scheduleEnabled ? scheduleInterval !== 'none' : true) &&
    !isLoading;

  // Connected services are auto-selected (same as mobile)
  const handleConnectorToggle = useCallback((_id: string) => {
    // No-op: connected services that are suggested are automatically selected
  }, []);

  const handleSave = useCallback(() => {
    if (!canSave) return;

    const ruleData: {
      rule_id: string;
      w_id: string[];
      raw_text: string;
      status: 'active' | 'inactive';
      trigger_time?: string;
      interval?: number;
    } = {
      rule_id: rule.rule_id,
      w_id: selectedGroups,
      raw_text: rawText,
      status: rule.status,
    };

    if (scheduleEnabled) {
      ruleData.trigger_time = buildTriggerTimeUTC(scheduleTime);
      ruleData.interval = INTERVAL_TO_DAYS[scheduleInterval];
    }

    updateRule(ruleData, {
      onSuccess: () => {
        router.push(ROUTES.WORKSPACE);
      },
    });
  }, [
    canSave,
    rule.rule_id,
    rule.status,
    rawText,
    selectedGroups,
    scheduleEnabled,
    scheduleTime,
    scheduleInterval,
    updateRule,
    router,
  ]);

  const handleDelete = useCallback(() => {
    deleteRule(
      { rule_id: rule.rule_id },
      {
        onSuccess: () => {
          setShowDeleteDialog(false);
          router.push(ROUTES.WORKSPACE);
        },
      },
    );
  }, [rule.rule_id, deleteRule, router]);

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
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Edit Rule</h1>
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-5 w-5" />
          </button>
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
            <div className="rounded-2xl border border-border bg-card p-3">
              <Textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Describe what this rule should do..."
                className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-[15px] focus-visible:ring-0 p-4"
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

        {/* Bottom Save Button */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background px-5 py-4">
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'w-full rounded-2xl py-6 text-base font-semibold',
              !canSave && 'opacity-50',
            )}
          >
            <Check className="mr-2 h-5 w-5" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>

      {/* Group Picker Dialog */}
      <Dialog
        open={showGroupPicker}
        onOpenChange={open => {
          setShowGroupPicker(open);
          if (!open) setGroupSearchQuery('');
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Groups & Chats</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={groupSearchQuery}
              onChange={e => setGroupSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            <GroupSelector
              groups={filteredGroups}
              selected={selectedGroups}
              onChange={setSelectedGroups}
              label="WhatsApp Groups & Chats"
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowGroupPicker(false)}>
              Done ({selectedGroups.length} selected)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
              {isDeleting ? 'Deleting...' : 'Delete Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScreenLayout>
  );
}


export default function EditRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;

  

  const isLoadingRules = false;
  const rules = MOCK_RULES;
  const rule = useMemo(
    () => rules?.find(r => r.rule_id === ruleId),
    [rules, ruleId],
  );

  // Fetch connectors status
  const { data: connectorsData } = useConnectors();

  // Fetch only moderated WhatsApp groups
  const { data: wahaModeratedGroups } = useWahaGroups({
    moderation_status: true,
  });
  const groups = useMemo(() => {
    // Deduplicate groups and chats by w_id
    const uniqueItems = new Map();

    // Add groups first
    (wahaModeratedGroups?.groups ?? []).forEach(g => {
      uniqueItems.set(g.w_id, g);
    });

    // Add chats, avoiding duplicates
    (wahaModeratedGroups?.chats ?? []).forEach(g => {
      if (!uniqueItems.has(g.w_id)) {
        uniqueItems.set(g.w_id, g);
      }
    });

    // Convert to required format
    return Array.from(uniqueItems.values()).map(g => ({
      id: g.w_id,
      name: g.chat_name,
      rulesCount: g.num_active_rules + g.num_inactive_rules,
    }));
  }, [wahaModeratedGroups]);

  // Build connectors list
  const connectors: Connector[] = useMemo(() => {
    const services = connectorsData?.available_services ?? [];
    return [
      {
        id: 'google_drive',
        name: 'Google Drive',
        icon: 'drive' as const,
        isConnected: services.includes('google_drive'),
      },
      {
        id: 'google_calendar',
        name: 'Google Calendar',
        icon: 'calendar' as const,
        isConnected: services.includes('google_calendar'),
      },
      {
        id: 'email_scope',
        name: 'Email',
        icon: 'mail' as const,
        isConnected: services.includes('email_scope'),
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: 'whatsapp' as const,
        isConnected: services.includes('whatsapp'),
      },
    ];
  }, [connectorsData]);

  if (isLoadingRules) {
    return (
      <ScreenLayout maxWidth="lg" className="relative min-h-screen pb-24">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <div className="space-y-6 px-5 pt-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </ScreenLayout>
    );
  }

  if (!rule || !rule.rule_id || !rule.raw_text) {
    return (
      <ScreenLayout maxWidth="lg" className="py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Rule not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(ROUTES.WORKSPACE)}
          >
            Back to Workspace
          </Button>
        </div>
      </ScreenLayout>
    );
  }

  // Render form with rule data - key ensures fresh state when rule changes
  return (
    <EditRuleForm
      key={rule.rule_id}
      rule={{
        rule_id: rule.rule_id,
        raw_text: rule.raw_text,
        status: rule.status ?? 'active',
        w_id: rule.w_id ?? [],
        trigger_time: rule.trigger_time,
        interval: rule.interval,
      }}
      connectors={connectors}
      groups={groups}
    />
  );
}
