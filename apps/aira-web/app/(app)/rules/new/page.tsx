'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RuleForm, type RuleFormSubmitData } from '@/components/editor';
import { ROUTES } from '@/lib/constants';
import {
  useCreateRule,
  useConnectConnector,
} from '@repo/core';
import { useRuleFormData } from '@/hooks/use-rule-form-data';
import type { CreateRuleRequest } from '@repo/core';

function NewRuleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { groups, connectors } = useRuleFormData();

  const { mutate: connectConnector } = useConnectConnector();
  const { mutate: createRule, isPending: isCreating } = useCreateRule();

  const initialRawText = searchParams.get('suggestion') ?? '';
  const initialSelectedGroups = (() => {
    const chatIds = searchParams.get('chatIds');
    const chatId = searchParams.get('chatId');
    if (chatIds) return chatIds.split(',').filter(Boolean);
    if (chatId) return [chatId];
    return [];
  })();
  const suggestionId = searchParams.get('suggestion_id');

  const handleSave = (data: RuleFormSubmitData) => {
    const ruleData: CreateRuleRequest = {
      w_id: data.w_id,
      raw_text: data.raw_text,
      status: 'active',
      ...(data.trigger_time && { trigger_time: data.trigger_time }),
      ...(data.interval !== undefined && { interval: data.interval }),
      ...(data.suggestion_id && { suggestion_id: data.suggestion_id }),
    };

    createRule(ruleData, {
      onSuccess: () => router.back(),
    });
  };

  const handleIntegrate = (connectorId: string) => {
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
  };

  return (
    <RuleForm
      mode="create"
      connectors={connectors}
      groups={groups}
      onSave={handleSave}
      onBack={() => router.back()}
      isSaving={isCreating}
      saveLabel={isCreating ? 'Creating...' : 'Create Rule'}
      headerTitle="Create Rule"
      initialRawText={initialRawText}
      initialSelectedGroups={initialSelectedGroups}
      suggestionId={suggestionId}
      onIntegrate={handleIntegrate}
    />
  );
}

export default function NewRulePage() {
  return (
    <Suspense fallback={null}>
      <NewRuleContent />
    </Suspense>
  );
}
