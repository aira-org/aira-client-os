'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { ScreenLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RuleItem } from '@/components/workspace';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import {
  useChatRules,
  useWahaGroups,
  useUpdateRule,
} from '@repo/core';

export default function GroupRulesPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const [searchQuery, setSearchQuery] = useState('');

  const { data: wahaData } = useWahaGroups({ moderation_status: true });
  const { data: rules, isLoading, refetch } = useChatRules(groupId);
  const { mutate: updateRule } = useUpdateRule();

  const group = useMemo(() => {
    const items = [...(wahaData?.groups ?? []), ...(wahaData?.chats ?? [])];
    return items.find(item => item.w_id === groupId);
  }, [wahaData, groupId]);

  const filteredRules = useMemo(
    () =>
      (rules ?? []).filter(
        rule =>
          rule.raw_text.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [rules, searchQuery],
  );

  const handleRuleToggle = (
    ruleId: string,
    currentStatus: 'active' | 'inactive',
    wId: string[],
    rawText: string,
  ) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateRule(
      { rule_id: ruleId, w_id: wId, raw_text: rawText, status: newStatus },
      { onSuccess: () => refetch() },
    );
  };

  if (isLoading) {
    return (
      <ScreenLayout maxWidth="xl" className="py-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </ScreenLayout>
    );
  }

  if (!group) {
    return (
      <ScreenLayout maxWidth="xl" className="py-6">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Group not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(ROUTES.GROUPS)}
          >
            Back to Groups
          </Button>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout maxWidth="xl" className="py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-whatsapp/20">
                <Users className="h-6 w-6 text-whatsapp" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {group.chat_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {group.num_active_rules + group.num_inactive_rules} rule
                  {(group.num_active_rules + group.num_inactive_rules) !== 1
                    ? 's'
                    : ''}
                </p>
              </div>
            </div>
          </div>

          <Link href={ROUTES.RULES_NEW}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>

        {/* Rules List */}
        {filteredRules.length > 0 ? (
          <div className="space-y-3">
            {filteredRules.map((rule, index) => (
              <motion.div
                key={rule.rule_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RuleItem
                  id={rule.rule_id}
                  title={
                    rule.raw_text.slice(0, 50) +
                    (rule.raw_text.length > 50 ? '...' : '')
                  }
                  description={rule.raw_text}
                  connectorType="whatsapp"
                  isEnabled={rule.status === 'active'}
                  onToggle={() =>
                    handleRuleToggle(
                      rule.rule_id,
                      rule.status ?? 'active',
                      rule.w_id,
                      rule.raw_text,
                    )
                  }
                  onClick={() => router.push(ROUTES.RULES_EDIT(rule.rule_id))}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No rules found' : 'No rules for this group yet'}
            </p>
            {!searchQuery && (
              <Link href={ROUTES.RULES_NEW}>
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Rule
                </Button>
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </ScreenLayout>
  );
}
