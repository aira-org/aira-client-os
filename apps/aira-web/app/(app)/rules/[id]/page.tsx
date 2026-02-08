'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RuleForm, type RuleFormValues } from '@/components/rules';
import type { Connector } from '@/components/editor';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ROUTES,
  INTERVAL_TO_DAYS,
  DAYS_TO_INTERVAL,
  ScheduleInterval,
} from '@/lib/constants';
import { buildTriggerTimeUTC, parseTriggerTimeToLocal } from '@/lib/utils';
import {
  useRules,
  useUpdateRule,
  useDeleteRule,
  useWahaGroups,
  useConnectors,
} from '@repo/core';

export default function EditRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;

  // Fetch all rules and find the one we're editing
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const rule = useMemo(
    () => rules?.find(r => r.rule_id === ruleId),
    [rules, ruleId],
  );

  // Fetch connectors status
  const { data: connectorsData } = useConnectors();

  // Fetch ALL WhatsApp groups (both moderated and unmoderated)
  const { data: wahaGroups } = useWahaGroups();

  // Build groups list with moderation status
  const groups = useMemo(() => {
    const uniqueItems = new Map();
    (wahaGroups?.groups ?? []).forEach(g => {
      uniqueItems.set(g.w_id, g);
    });
    (wahaGroups?.chats ?? []).forEach(g => {
      if (!uniqueItems.has(g.w_id)) {
        uniqueItems.set(g.w_id, g);
      }
    });
    return Array.from(uniqueItems.values()).map(g => ({
      id: g.w_id,
      name: g.chat_name,
      rulesCount: g.num_active_rules + g.num_inactive_rules,
      isModerated: g.moderation_status,
    }));
  }, [wahaGroups]);

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

  // Mutations
  const { mutate: updateRule, isPending: isUpdating } = useUpdateRule();
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteRule();

  // Compute initial values from rule
  const initialValues = useMemo(() => {
    if (!rule) return undefined;

    const hasSchedule = rule.trigger_time && rule.trigger_time !== 'Real-time';

    return {
      rawText: rule.raw_text,
      selectedGroups: rule.w_id ?? [],
      scheduleEnabled: !!hasSchedule,
      scheduleTime: hasSchedule
        ? parseTriggerTimeToLocal(rule.trigger_time ?? undefined)
        : '09:00',
      scheduleInterval: hasSchedule
        ? (DAYS_TO_INTERVAL[rule.interval ?? 0] ?? ScheduleInterval.DAILY)
        : ScheduleInterval.NONE,
    };
  }, [rule]);

  const handleSubmit = useCallback(
    (values: RuleFormValues) => {
      if (!rule) return;

      const ruleData: {
        rule_id: string;
        w_id: string[];
        raw_text: string;
        status: 'active' | 'inactive';
        trigger_time?: string;
        interval?: number;
      } = {
        rule_id: rule.rule_id,
        w_id: values.selectedGroups,
        raw_text: values.rawText,
        status: rule.status ?? 'active',
      };

      if (values.scheduleEnabled) {
        ruleData.trigger_time = buildTriggerTimeUTC(values.scheduleTime);
        ruleData.interval =
          INTERVAL_TO_DAYS[
            values.scheduleInterval as keyof typeof INTERVAL_TO_DAYS
          ];
      }

      updateRule(ruleData, {
        onSuccess: () => {
          router.push(ROUTES.WORKSPACE);
        },
      });
    },
    [rule, updateRule, router],
  );

  const handleDelete = useCallback(() => {
    if (!rule) return;

    deleteRule(
      { rule_id: rule.rule_id },
      {
        onSuccess: () => {
          router.push(ROUTES.WORKSPACE);
        },
      },
    );
  }, [rule, deleteRule, router]);

  // Loading state
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

  // Rule not found
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

  return (
    <RuleForm
      key={rule.rule_id}
      mode="edit"
      title="Edit Rule"
      initialValues={initialValues}
      connectors={connectors}
      groups={groups}
      isSubmitting={isUpdating}
      isDeleting={isDeleting}
      onBack={() => router.back()}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
