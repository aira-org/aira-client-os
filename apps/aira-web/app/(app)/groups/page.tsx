'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Users, ChevronRight } from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import { useWahaGroups } from '@repo/core';

export default function GroupsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: wahaData, isLoading } = useWahaGroups({ moderation_status: true });

  const groups = useMemo(() => {
    const items = [...(wahaData?.groups ?? []), ...(wahaData?.chats ?? [])];
    const seen = new Set<string>();
    return items.filter(item => {
      if (seen.has(item.w_id)) return false;
      seen.add(item.w_id);
      return true;
    });
  }, [wahaData]);

  const filteredGroups = useMemo(
    () =>
      groups.filter(g =>
        g.chat_name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [groups, searchQuery],
  );

  if (isLoading) {
    return (
      <ScreenLayout maxWidth="xl" className="py-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
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
              {groups.length} groups connected
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
          {filteredGroups.map((group, index) => {
            const rulesCount = group.num_active_rules + group.num_inactive_rules;
            return (
              <motion.div
                key={group.w_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <Card
                  className="cursor-pointer transition-colors hover:border-primary/50"
                  onClick={() => router.push(ROUTES.GROUP_RULES(group.w_id))}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-whatsapp/20">
                      <Users className="h-6 w-6 text-whatsapp" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {group.chat_name}
                      </h3>
                    </div>
                    {rulesCount > 0 && (
                      <Badge variant="secondary">
                        {rulesCount} rule{rulesCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
