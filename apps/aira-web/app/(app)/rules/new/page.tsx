'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RuleForm, type RuleFormValues } from '@/components/rules';
import type { Connector } from '@/components/editor';
import { ROUTES, INTERVAL_TO_DAYS } from '@/lib/constants';
import { buildTriggerTimeUTC } from '@/lib/utils';
import {
  useCreateRule,
  useWahaGroups,
  useConnectors,
  useConnectConnector,
} from '@repo/core';
import type { CreateRuleRequest } from '../../../../../../packages/core/src/schemas';

export default function NewRulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestionId = searchParams.get('suggestion_id');

  // Fetch connectors status
  const { data: connectorsData } = useConnectors();

  // Fetch ALL WhatsApp groups (both moderated and unmoderated)
  const { data: wahaData } = useWahaGroups();

  // Build groups list with moderation status
  const groups = useMemo(() => {
    const uniqueItems = new Map();
    (wahaData?.groups ?? []).forEach(g => {
      uniqueItems.set(g.w_id, g);
    });
    (wahaData?.chats ?? []).forEach(g => {
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

  // Initial values from URL params
  const initialValues = useMemo(() => {
    const suggestion = searchParams.get('suggestion') ?? '';
    const chatIds = searchParams.get('chatIds');
    const chatId = searchParams.get('chatId');

    let selectedGroups: string[] = [];
    if (chatIds) selectedGroups = chatIds.split(',').filter(Boolean);
    else if (chatId) selectedGroups = [chatId];

    return {
      rawText: suggestion,
      selectedGroups,
    };
  }, [searchParams]);

  const handleConnect = useCallback(
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

  const handleSubmit = useCallback(
    (values: RuleFormValues) => {
      const ruleData: CreateRuleRequest = {
        w_id: values.selectedGroups,
        raw_text: values.rawText,
        status: 'active',
        ...(suggestionId && { suggestion_id: suggestionId }),
      };

      if (values.scheduleEnabled) {
        ruleData.trigger_time = buildTriggerTimeUTC(values.scheduleTime);
        ruleData.interval =
          INTERVAL_TO_DAYS[
            values.scheduleInterval as keyof typeof INTERVAL_TO_DAYS
          ];
      }

      createRule(ruleData, {
        onSuccess: () => {
          router.back();
        },
      });
    },
    [createRule, router, suggestionId],
  );

  return (
    <RuleForm
      mode="create"
      title="Create Rule"
      initialValues={initialValues}
      connectors={connectors}
      groups={groups}
      isSubmitting={isCreating}
      onBack={() => router.back()}
      onSubmit={handleSubmit}
      onConnect={handleConnect}
    />
  );
}
