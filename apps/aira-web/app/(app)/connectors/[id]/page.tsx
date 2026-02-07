'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Mail,
  Calendar,
  HardDrive,
  Plus,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ScreenLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RuleItem } from '@/components/workspace';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useRules, useUpdateRule, type Rule } from '@repo/core';

const connectorConfig: Record<
  string,
  {
    name: string;
    icon: typeof MessageCircle;
    color: string;
    keywords: string[];
  }
> = {
  whatsapp: {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-whatsapp',
    keywords: ['whatsapp', 'group', 'chat', 'message'],
  },
  email: {
    name: 'Email',
    icon: Mail,
    color: 'text-email',
    keywords: ['email', 'mail', 'send', 'inbox'],
  },
  calendar: {
    name: 'Calendar',
    icon: Calendar,
    color: 'text-calendar',
    keywords: [
      'calendar',
      'event',
      'meeting',
      'schedule',
      'appointment',
      'reminder',
    ],
  },
  drive: {
    name: 'Drive',
    icon: HardDrive,
    color: 'text-drive',
    keywords: ['drive', 'file', 'document', 'folder', 'upload', 'download'],
  },
};

function ruleMatchesConnector(rule: Rule, connectorId: string): boolean {
  if (connectorId === 'whatsapp') return true;
  const config = connectorConfig[connectorId];
  if (!config) return false;
  const text = rule.raw_text.toLowerCase();
  return config.keywords.some(kw => text.includes(kw));
}

function getConnectorTypeForRule(
  rule: Rule,
): 'whatsapp' | 'email' | 'calendar' | 'drive' {
  const text = rule.raw_text.toLowerCase();
  for (const [id, config] of Object.entries(connectorConfig)) {
    if (id === 'whatsapp') continue;
    if (config.keywords.some(kw => text.includes(kw))) {
      return id as 'email' | 'calendar' | 'drive';
    }
  }
  return 'whatsapp';
}

function RulesListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-5" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function ConnectorRulesPage() {
  const router = useRouter();
  const params = useParams();
  const connectorId = params.id as string;
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const config = connectorConfig[connectorId] || connectorConfig.whatsapp;
  const Icon = config.icon;

  const { data: allRules, isLoading, refetch } = useRules();
  const { mutate: updateRule } = useUpdateRule();

  const connectorRules = useMemo(() => {
    if (!allRules) return [];
    return allRules.filter(rule => ruleMatchesConnector(rule, connectorId));
  }, [allRules, connectorId]);

  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return connectorRules;
    const q = searchQuery.trim().toLowerCase();
    return connectorRules.filter(rule =>
      rule.raw_text.toLowerCase().includes(q),
    );
  }, [connectorRules, searchQuery]);

  const handleRuleToggle = (rule: Rule) => {
    const newStatus = rule.status === 'active' ? 'inactive' : 'active';
    updateRule(
      {
        rule_id: rule.rule_id,
        w_id: rule.w_id,
        raw_text: rule.raw_text,
        status: newStatus,
      },
      {
        onSuccess: () => {
          showToast(
            `Rule ${newStatus === 'active' ? 'enabled' : 'disabled'}`,
            'success',
          );
          refetch();
        },
        onError: () => {
          showToast('Failed to update rule', 'error');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <ScreenLayout maxWidth="xl" className="py-6">
        <RulesListSkeleton />
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                )}
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-${connectorId}) 20%, transparent)`,
                }}
              >
                <Icon className={cn('h-6 w-6', config.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">
                    {config.name}
                  </h1>
                  <div className="flex items-center gap-1 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Connected</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {connectorRules.length} rule
                  {connectorRules.length !== 1 ? 's' : ''} configured
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
                  connectorType={getConnectorTypeForRule(rule)}
                  isEnabled={rule.status === 'active'}
                  onToggle={() => handleRuleToggle(rule)}
                  onClick={() => router.push(ROUTES.RULES_EDIT(rule.rule_id))}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No rules found'
                : `No rules for ${config.name} yet`}
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
