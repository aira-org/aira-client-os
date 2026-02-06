'use client';

import React, { useState } from 'react';
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
import { RuleItem } from '@/components/workspace';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

const connectorConfig: Record<
  string,
  { name: string; icon: typeof MessageCircle; color: string }
> = {
  whatsapp: { name: 'WhatsApp', icon: MessageCircle, color: 'text-whatsapp' },
  email: { name: 'Email', icon: Mail, color: 'text-email' },
  calendar: { name: 'Calendar', icon: Calendar, color: 'text-calendar' },
  drive: { name: 'Drive', icon: HardDrive, color: 'text-drive' },
};

// Mock rules by connector type
const MOCK_RULES: Record<
  string,
  Array<{
    id: string;
    title: string;
    description: string;
    connectorType: 'whatsapp' | 'email' | 'calendar' | 'drive';
    isEnabled: boolean;
  }>
> = {
  whatsapp: [
    {
      id: '1',
      title: 'Auto-reply to urgent messages',
      description: 'Send automatic responses when someone mentions "urgent"',
      connectorType: 'whatsapp',
      isEnabled: true,
    },
    {
      id: '2',
      title: 'Forward important messages',
      description: 'Forward messages from VIP contacts to email',
      connectorType: 'whatsapp',
      isEnabled: true,
    },
  ],
  email: [
    {
      id: '3',
      title: 'Forward receipts to accounting',
      description: 'Auto-forward emails with "receipt" in subject',
      connectorType: 'email',
      isEnabled: true,
    },
  ],
  calendar: [
    {
      id: '4',
      title: 'Meeting summary to WhatsApp',
      description: 'Send meeting summaries to relevant WhatsApp groups',
      connectorType: 'calendar',
      isEnabled: false,
    },
  ],
  drive: [],
};

export default function ConnectorRulesPage() {
  const router = useRouter();
  const params = useParams();
  const connectorId = params.id as string;
  const [searchQuery, setSearchQuery] = useState('');

  const config = connectorConfig[connectorId] || connectorConfig.whatsapp;
  const Icon = config.icon;
  const connectorRules = MOCK_RULES[connectorId] || [];

  const [rules, setRules] = useState(connectorRules);

  const filteredRules = rules.filter(
    rule =>
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRuleToggle = (id: string, enabled: boolean) => {
    setRules(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, isEnabled: enabled } : rule,
      ),
    );
  };

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
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                  `bg-${connectorId}/20`,
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
                  {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
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
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RuleItem
                  id={rule.id}
                  title={rule.title}
                  description={rule.description}
                  connectorType={rule.connectorType}
                  isEnabled={rule.isEnabled}
                  onToggle={enabled => handleRuleToggle(rule.id, enabled)}
                  onClick={() => router.push(ROUTES.RULES_EDIT(rule.id))}
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
