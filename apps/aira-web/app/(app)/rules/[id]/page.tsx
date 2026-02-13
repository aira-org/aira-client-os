'use client';

import React, { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RuleForm, type RuleFormSubmitData } from '@/components/editor';
import { ROUTES } from '@/lib/constants';
import {
  useRules,
  useUpdateRule,
  useDeleteRule,
} from '@repo/core';
import { useRuleFormData } from '@/hooks/use-rule-form-data';
import { Button } from '@/components/ui/button';
import { ScreenLayout } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;

  const { groups, connectors } = useRuleFormData();
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const { mutate: updateRule, isPending: isUpdating } = useUpdateRule();
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteRule();

  const rule = useMemo(
    () => rules?.find(r => r.rule_id === ruleId),
    [rules, ruleId],
  );

  const handleSave = (data: RuleFormSubmitData) => {
    if (!rule?.rule_id) return;

    updateRule(
      {
        rule_id: rule.rule_id,
        w_id: data.w_id,
        raw_text: data.raw_text,
        status: rule.status ?? 'active',
        ...(data.trigger_time && { trigger_time: data.trigger_time }),
        ...(data.interval !== undefined && { interval: data.interval }),
      },
      {
        onSuccess: () => router.push(ROUTES.WORKSPACE),
      },
    );
  };

  const handleDelete = () => {
    if (!rule?.rule_id) return;

    deleteRule(
      { rule_id: rule.rule_id },
      {
        onSuccess: () => {
          router.push(ROUTES.WORKSPACE);
        },
      },
    );
  };

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

  return (
    <RuleForm
      key={rule.rule_id}
      mode="edit"
      connectors={connectors}
      groups={groups}
      onSave={handleSave}
      onBack={() => router.back()}
      isSaving={isUpdating}
      saveLabel={isUpdating ? 'Saving...' : 'Save Changes'}
      headerTitle="Edit Rule"
      rule={{
        rule_id: rule.rule_id,
        raw_text: rule.raw_text,
        status: rule.status ?? 'active',
        w_id: rule.w_id ?? [],
        trigger_time: rule.trigger_time ?? undefined,
        interval: rule.interval ?? undefined,
      }}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
