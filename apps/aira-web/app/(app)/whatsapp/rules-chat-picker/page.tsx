'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, ListChecks, ListX } from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ROUTES, SPRING_CONFIG } from '@/lib/constants';
import { useWahaGroups } from '@repo/core';
import type { WahaChatItem } from '@repo/core';
import Header from '@/components/ui/header';

type TabType = 'groups' | 'chats';

function AnimatedCheckbox({ checked }: { checked: boolean }) {
  return (
    <motion.div
      className={cn(
        'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-colors',
        checked ? 'border-primary bg-primary' : 'border-border bg-transparent',
      )}
      initial={false}
      animate={{
        scale: checked ? [1, 1.1, 1] : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: checked ? 1 : 0,
          scale: checked ? 1 : 0.5,
        }}
        transition={{ duration: 0.15 }}
      >
        <Check
          className="h-3.5 w-3.5 text-primary-foreground"
          strokeWidth={3}
        />
      </motion.div>
    </motion.div>
  );
}

interface ListItemProps {
  item: WahaChatItem;
  index: number;
  selected: boolean;
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function ListItem({
  item,
  index,
  selected,
  onPress,
  isFirst,
  isLast,
}: ListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), ...SPRING_CONFIG }}
    >
      <button
        onClick={onPress}
        className={cn(
          'group relative flex w-full items-center gap-4 bg-card px-4 border border-border border-b-0 transition-colors hover:bg-accent/50',
          isFirst && 'rounded-t-2xl',
          isLast && 'rounded-b-2xl border-b',
        )}
      >
        {/* Avatar */}
        <div className="py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <span className="text-lg font-bold text-foreground">
              {(item.chat_name || '??').toUpperCase().slice(0, 2)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center gap-4 py-4">
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground line-clamp-1">
              {item.chat_name || 'Unknown Chat'}
            </p>
          </div>

          {/* Checkbox */}
          <AnimatedCheckbox checked={selected} />
        </div>

        {/* Separator */}
        {!isLast && (
          <div className="absolute bottom-0 left-20 right-4 h-px bg-border/40" />
        )}
      </button>
    </motion.div>
  );
}

interface SelectedChat {
  id: string;
  name: string;
}

export default function RulesChatPickerPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('groups');

  // Fetch groups/chats with moderation_status=true (only moderated chats)
  const { data, isLoading, error } = useWahaGroups({ moderation_status: true });

  // Deduplicate groups by w_id
  const groups = useMemo(() => {
    const rawGroups = data?.groups ?? [];
    const uniqueMap = new Map();
    rawGroups.forEach(item => {
      if (!uniqueMap.has(item.w_id)) {
        uniqueMap.set(item.w_id, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [data?.groups]);

  // Deduplicate chats by w_id
  const chats = useMemo(() => {
    const rawChats = data?.chats ?? [];
    const uniqueMap = new Map();
    rawChats.forEach(item => {
      if (!uniqueMap.has(item.w_id)) {
        uniqueMap.set(item.w_id, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [data?.chats]);

  // Single selection state
  const [selectedItem, setSelectedItem] = useState<SelectedChat | null>(null);

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups.filter(g => g.chat_name.toLowerCase().includes(q));
  }, [query, groups]);

  const filteredChats = useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter(g => g.chat_name.toLowerCase().includes(q));
  }, [query, chats]);

  const filtered = activeTab === 'groups' ? filteredGroups : filteredChats;

  const isSelected = useCallback(
    (w_id: string) => selectedItem?.id === w_id,
    [selectedItem],
  );

  const allSelected = useMemo(
    () => filtered.length > 0 && filtered.every(g => isSelected(g.w_id)),
    [filtered, isSelected],
  );

  const hasSelection = selectedItem !== null;

  const handleTabChange = useCallback(
    (tab: TabType) => {
      if (tab === activeTab) return;
      setActiveTab(tab);
    },
    [activeTab],
  );

  const toggle = useCallback((w_id: string, name: string) => {
    setSelectedItem(prev => {
      if (prev?.id === w_id) {
        return null;
      }
      return { id: w_id, name };
    });
  }, []);

  const toggleAll = useCallback(() => {
    // For single selection, select the first item if none selected
    if (!selectedItem && filtered.length > 0) {
      const first = filtered[0];
      setSelectedItem({ id: first.w_id, name: first.chat_name });
    } else {
      setSelectedItem(null);
    }
  }, [filtered, selectedItem]);

  const handleConfirm = useCallback(() => {
    if (!selectedItem) return;

    // Navigate to RuleEditor with pre-filled chat data
    const params = new URLSearchParams({
      chatId: selectedItem.id,
      chatName: selectedItem.name,
    });
    router.push(`${ROUTES.RULES_NEW}?${params.toString()}`);
  }, [selectedItem, router]);

  // Loading state
  if (isLoading) {
    return (
      <ScreenLayout
        maxWidth="md"
        className="flex items-center justify-center py-4"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </ScreenLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenLayout
        maxWidth="md"
        className="flex items-center justify-center py-4"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">Failed to load chats</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </ScreenLayout>
    );
  }

  // Empty state
  if (groups.length === 0 && chats.length === 0) {
    return (
      <ScreenLayout
        maxWidth="md"
        className="flex items-center justify-center py-4"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">
            No moderated chats found. Please set up WhatsApp first.
          </p>
          <Button
            onClick={() => router.push(ROUTES.WHATSAPP_SETUP)}
            variant="outline"
          >
            Set Up WhatsApp
          </Button>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <>
      <ScreenLayout maxWidth="md" className="flex flex-col py-4" padded={false}>
        <Header title="Select Chat" align="center" close={false} />
        <div className="flex flex-1 flex-col px-4">
          {/* Search Bar */}
          <div className="mb-3">
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border bg-card pl-4 transition-all',
                isSearchFocused
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border',
              )}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="h-10 border-0 bg-transparent pl-0 outline-none! focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Tab Row */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('groups')}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  activeTab === 'groups'
                    ? 'border-primary bg-card text-foreground'
                    : 'border-border bg-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                Groups ({filteredGroups.length})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('chats')}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  activeTab === 'chats'
                    ? 'border-primary bg-card text-foreground'
                    : 'border-border bg-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                Chats ({filteredChats.length})
              </button>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center justify-center rounded-lg border border-border bg-card p-2 transition-colors hover:bg-accent/50"
            >
              {allSelected ? (
                <ListX className="h-5 w-5 text-primary" strokeWidth={2} />
              ) : (
                <ListChecks className="h-5 w-5 text-primary" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-0 pb-24">
              {filtered?.map((item, index) => (
                <ListItem
                  key={item.w_id}
                  item={item}
                  index={index}
                  selected={isSelected(item.w_id)}
                  onPress={() => toggle(item.w_id, item.chat_name)}
                  isFirst={index === 0}
                  isLast={index === filtered?.length - 1}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </ScreenLayout>

      {/* Bottom Bar */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={SPRING_CONFIG}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background px-4 py-4"
          >
            <div className="mx-auto flex max-w-md items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">1</span>
                <span className="text-muted-foreground">selected</span>
              </div>

              <Button type="button" onClick={handleConfirm} size="default">
                Create Rule
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
