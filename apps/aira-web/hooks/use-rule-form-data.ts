'use client';

import { useMemo } from 'react';
import { useWahaGroups, useConnectors } from '@repo/core';
import type { Connector } from '@/components/editor';

export interface RuleFormGroup {
  id: string;
  name: string;
  rulesCount?: number;
}

export function useRuleFormData() {
  const { data: connectorsData } = useConnectors();
  const { data: wahaData } = useWahaGroups({ moderation_status: true });

  const groups: RuleFormGroup[] = useMemo(() => {
    const uniqueItems = new Map<string, { w_id: string; chat_name: string; num_active_rules: number; num_inactive_rules: number }>();

    (wahaData?.groups ?? []).forEach(g => {
      uniqueItems.set(g.w_id, {
        w_id: g.w_id,
        chat_name: g.chat_name,
        num_active_rules: g.num_active_rules,
        num_inactive_rules: g.num_inactive_rules,
      });
    });

    (wahaData?.chats ?? []).forEach(g => {
      if (!uniqueItems.has(g.w_id)) {
        uniqueItems.set(g.w_id, {
          w_id: g.w_id,
          chat_name: g.chat_name,
          num_active_rules: g.num_active_rules,
          num_inactive_rules: g.num_inactive_rules,
        });
      }
    });

    return Array.from(uniqueItems.values()).map(g => ({
      id: g.w_id,
      name: g.chat_name,
      rulesCount: g.num_active_rules + g.num_inactive_rules,
    }));
  }, [wahaData]);

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

  return { groups, connectors };
}
