'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { ScreenLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RuleItem } from '@/components/workspace';
import { ROUTES } from '@/lib/constants';

// Mock data
const MOCK_GROUP = {
  id: '1',
  name: 'Project Alpha Team',
  memberCount: 12,
};

const MOCK_RULES = [
  {
    id: '1',
    title: 'Auto-reply to urgent messages',
    description: 'Send automatic responses when someone mentions "urgent"',
    connectorType: 'whatsapp' as const,
    isEnabled: true,
  },
  {
    id: '2',
    title: 'Daily standup reminder',
    description: 'Send a reminder at 9 AM every day for the team standup',
    connectorType: 'whatsapp' as const,
    isEnabled: true,
  },
  {
    id: '3',
    title: 'Meeting notes summary',
    description:
      'Automatically post meeting notes summary after calendar events',
    connectorType: 'whatsapp' as const,
    isEnabled: false,
  },
];

export default function GroupRulesPage() {
  const router = useRouter();
  const _params = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [rules, setRules] = useState(MOCK_RULES);

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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-whatsapp/20">
                <Users className="h-6 w-6 text-whatsapp" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {MOCK_GROUP.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {MOCK_GROUP.memberCount} members
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
