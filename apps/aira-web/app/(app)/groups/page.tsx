'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Users, ChevronRight } from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';

// Mock groups data
const MOCK_GROUPS = [
  { id: '1', name: 'Project Alpha Team', memberCount: 12, rulesCount: 3 },
  { id: '2', name: 'Marketing Team', memberCount: 8, rulesCount: 2 },
  { id: '3', name: 'Sales Updates', memberCount: 15, rulesCount: 5 },
  { id: '4', name: 'Engineering', memberCount: 20, rulesCount: 1 },
  { id: '5', name: 'Leadership', memberCount: 5, rulesCount: 0 },
  { id: '6', name: 'Design Team', memberCount: 6, rulesCount: 2 },
];

export default function GroupsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = MOCK_GROUPS.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ScreenLayout maxWidth="xl" className="py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              WhatsApp Groups
            </h1>
            <p className="text-sm text-muted-foreground">
              {MOCK_GROUPS.length} groups connected
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>

        {/* Groups List */}
        <div className="space-y-3">
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
            >
              <Card
                className="cursor-pointer transition-colors hover:border-primary/50"
                onClick={() => router.push(ROUTES.GROUP_RULES(group.id))}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-whatsapp/20">
                    <Users className="h-6 w-6 text-whatsapp" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      {group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {group.memberCount} members
                    </p>
                  </div>
                  {group.rulesCount > 0 && (
                    <Badge variant="secondary">
                      {group.rulesCount} rule{group.rulesCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No groups found</p>
          </div>
        )}
      </motion.div>
    </ScreenLayout>
  );
}
