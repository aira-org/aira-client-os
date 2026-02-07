'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Check,
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
import { ROUTES } from '@/lib/constants';
import { useToast } from '@/components/ui/toast';
import {
  useCreateRule,
  useWahaGroups,
  useConnectors,
  useConnectConnector,
} from '@repo/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type CreateRuleRequest } from '@repo/core';

const INTERVAL_TO_DAYS: Record<IntervalType, number> = {
  none: 0,
  once: 0,
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

const buildTriggerTimeUTC = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  return now.toISOString();
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

export default function NewRulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const { data: connectorsData } = useConnectors();

  // Fetch WhatsApp groups
  const { data: wahaData } = useWahaGroups({ moderation_status: true });
  const groups = useMemo(() => {
    // Deduplicate groups and chats by w_id
    const uniqueItems = new Map();

    // Add groups first
    (wahaData?.groups ?? []).forEach(g => {
      uniqueItems.set(g.w_id, g);
    });

    // Add chats, avoiding duplicates
    (wahaData?.chats ?? []).forEach(g => {
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
  }, [wahaData]);

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

  // Connect mutation
  const { mutate: connectConnector } = useConnectConnector();

  // Create rule mutation
  const { mutate: createRule, isPending: isCreating } = useCreateRule();

  // Form state (initialized from URL so we don't need an effect)
  const [rawText, setRawText] = useState(
    () => searchParams.get('suggestion') ?? '',
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(() => {
    const chatIds = searchParams.get('chatIds');
    const chatId = searchParams.get('chatId');
    if (chatIds) return chatIds.split(',').filter(Boolean);
    if (chatId) return [chatId];
    return [];
  });
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleInterval, setScheduleInterval] =
    useState<IntervalType>('none');
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const suggestionId = searchParams.get('suggestion_id');

  // Derived state
  const suggestedConnectorIds = useMemo(
    () => getSuggestedConnectorIds(rawText),
    [rawText],
  );
  const matchedKeywords = useMemo(() => detectKeywords(rawText), [rawText]);

  const [manuallyToggledOff, setManuallyToggledOff] = useState<Set<string>>(
    new Set(),
  );

  const selectedConnectors = useMemo(() => {
    const connectedIds = connectors.filter(c => c.isConnected).map(c => c.id);
    return suggestedConnectorIds
      .filter(id => connectedIds.includes(id))
      .filter(id => !manuallyToggledOff.has(id));
  }, [suggestedConnectorIds, connectors, manuallyToggledOff]);

  const showGroupSelector = selectedConnectors.includes('whatsapp');

  const filteredGroups = useMemo(() => {
    if (!groupSearchQuery.trim()) return groups;
    const q = groupSearchQuery.trim().toLowerCase();
    return groups.filter(
      g => g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q),
    );
  }, [groups, groupSearchQuery]);

  const canSave =
    rawText.trim().length > 0 &&
    (showGroupSelector ? selectedGroups.length > 0 : true) &&
    (scheduleEnabled ? scheduleInterval !== 'none' : true) &&
    !isCreating;

  const handleConnectorToggle = useCallback((id: string) => {
    setManuallyToggledOff(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleIntegrate = useCallback(
    (connectorId: string) => {
      if (connectorId === 'whatsapp') {
        router.push(ROUTES.WHATSAPP_SETUP);
      } else {
        const serviceNameMap: Record<string, string> = {
          email_scope: 'email_scope',
          google_calendar: 'google_calendar',
          google_drive: 'google_drive',
        };
        const serviceName = serviceNameMap[connectorId];
        if (serviceName) {
          connectConnector(
            {
              connectorType: serviceName as
                | 'email_scope'
                | 'google_calendar'
                | 'google_drive',
              platform: 'web',
            },
            {
              onSuccess: data => {
                if (data.redirect_url) {
                  window.location.href = data.redirect_url;
                }
              },
            },
          );
        }
      }
    },
    [router, connectConnector],
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;

    const ruleData: CreateRuleRequest = {
      w_id: selectedGroups,
      raw_text: rawText,
      status: 'active',
      ...(suggestionId && { suggestion_id: suggestionId }),
    };

    if (scheduleEnabled) {
      ruleData.trigger_time = buildTriggerTimeUTC(scheduleTime);
      ruleData.interval = INTERVAL_TO_DAYS[scheduleInterval];
    }

    createRule(ruleData, {
      onSuccess: () => {
        showToast('Rule created successfully', 'success');
        router.back();
      },
      onError: () => {
        showToast('Failed to create rule. Please try again.', 'error');
      },
    });
  }, [
    canSave,
    rawText,
    selectedGroups,
    scheduleEnabled,
    scheduleTime,
    scheduleInterval,
    createRule,
    router,
    suggestionId,
    showToast,
  ]);

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
          <h1 className="text-lg font-semibold text-foreground">Create Rule</h1>
          <div className="w-10" />
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
                className="min-h-25 resize-none border-0 bg-transparent p-3 text-[15px] focus-visible:ring-0"
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
                onIntegrate={handleIntegrate}
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
            {isCreating ? 'Creating...' : 'Create Rule'}
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
    </ScreenLayout>
  );
}
