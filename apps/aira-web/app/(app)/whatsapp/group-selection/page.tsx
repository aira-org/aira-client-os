'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, ListChecks, ListX, RefreshCw } from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ROUTES, SPRING_CONFIG } from '@/lib/constants';
import { useWahaGroups, useWahaSyncChats } from '@repo/core';
import type { WahaChatItem } from '@repo/core';
import Header from '@/components/ui/header';

// Empty State Animated SVG
function EmptyChatsIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-48"
    >
      {/* Background Circle */}
      <motion.circle
        cx="100"
        cy="100"
        r="80"
        className="fill-muted/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Large Chat Bubble */}
      <motion.g
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
      >
        <motion.path
          d="M140 70C140 59.5066 131.493 51 121 51H79C68.5066 51 60 59.5066 60 70V95C60 105.493 68.5066 114 79 114H95L105 124L115 114H121C131.493 114 140 105.493 140 95V70Z"
          className="fill-muted"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Dots inside large bubble */}
        <motion.g
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="85" cy="82" r="4" className="fill-muted-foreground/40" />
          <circle cx="100" cy="82" r="4" className="fill-muted-foreground/40" />
          <circle cx="115" cy="82" r="4" className="fill-muted-foreground/40" />
        </motion.g>
      </motion.g>

      {/* Small Chat Bubble - Top Right */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'backOut' }}
      >
        <motion.path
          d="M160 55C160 48.9249 155.075 44 149 44H135C128.925 44 124 48.9249 124 55V65C124 71.0751 128.925 76 135 76H143L148 81L153 76H149C155.075 76 160 71.0751 160 65V55Z"
          className="fill-primary/20"
          animate={{ y: [0, -5, 0], x: [0, 3, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </motion.g>

      {/* Small Chat Bubble - Bottom Left */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: 'backOut' }}
      >
        <motion.path
          d="M76 125C76 120.582 72.4183 117 68 117H54C49.5817 117 46 120.582 46 125V132C46 136.418 49.5817 140 54 140H60L64 144L68 140H68C72.4183 140 76 136.418 76 132V125Z"
          className="fill-primary/20"
          animate={{ y: [0, 6, 0], x: [0, -3, 0] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </motion.g>

      {/* Search Icon / Magnifying Glass */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5, ease: 'backOut' }}
      >
        <motion.circle
          cx="135"
          cy="135"
          r="15"
          className="stroke-muted-foreground/60"
          strokeWidth="3"
          fill="none"
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.line
          x1="146"
          y1="146"
          x2="156"
          y2="156"
          className="stroke-muted-foreground/60"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.g>

      {/* Sparkles/Stars */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'easeInOut',
        }}
      >
        <path
          d="M45 65L46 68L49 69L46 70L45 73L44 70L41 69L44 68L45 65Z"
          className="fill-primary/60"
        />
        <path
          d="M155 110L156 112L158 113L156 114L155 116L154 114L152 113L154 112L155 110Z"
          className="fill-primary/60"
        />
      </motion.g>
    </svg>
  );
}

type ConnectionSource = 'fresh_connection' | 'existing_connection';

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
  const totalRules = item.num_active_rules + item.num_inactive_rules;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        layout: { ...SPRING_CONFIG, duration: 0.4 },
        opacity: { duration: 0.2 },
        y: { delay: Math.min(index * 0.03, 0.5), ...SPRING_CONFIG },
      }}
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
            <p className="text-sm text-muted-foreground">
              {totalRules} {totalRules === 1 ? 'rule' : 'rules'}
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

export default function WhatsAppGroupSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const _source = searchParams.get('source') as ConnectionSource | null;

  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('groups');

  const { data, isLoading, error } = useWahaGroups();
  const syncChats = useWahaSyncChats();

  // Deduplicate groups by w_id
  const groups = useMemo(() => {
    const rawGroups = data?.groups ?? [];
    const uniqueMap = new Map<string, WahaChatItem>();

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
    const uniqueMap = new Map<string, WahaChatItem>();

    rawChats.forEach(item => {
      if (!uniqueMap.has(item.w_id)) {
        uniqueMap.set(item.w_id, item);
      }
    });

    return Array.from(uniqueMap.values());
  }, [data?.chats]);

  // Combine groups and chats, ensuring no cross-duplicates
  const allItems = useMemo(() => {
    const uniqueItems = new Map<string, WahaChatItem>();

    // Add groups first
    groups.forEach(item => {
      uniqueItems.set(item.w_id, item);
    });

    // Add chats, avoiding duplicates with groups
    chats.forEach(item => {
      if (!uniqueItems.has(item.w_id)) {
        uniqueItems.set(item.w_id, item);
      }
    });

    return Array.from(uniqueItems.values());
  }, [groups, chats]);

  // selectedMap: UI display state (true = checked visually)
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  // interactedMap: only items the user explicitly toggled (sent to backend)
  const [interactedMap, setInteractedMap] = useState<Record<string, boolean>>(
    {},
  );

  // Track previous allItems length to detect when data first loads
  const [prevItemsLength, setPrevItemsLength] = useState(0);

  // When data loads for the first time, auto-select items with moderation_status (display only)
  if (allItems.length > 0 && prevItemsLength === 0) {
    setPrevItemsLength(allItems.length);

    const initialSelected: Record<string, boolean> = {};
    allItems.forEach(item => {
      if (item.moderation_status) {
        initialSelected[item.w_id] = true;
      }
    });
    setSelectedMap(initialSelected);
  }

  // Sort function: selected items first, maintaining stable order within each group
  const sortBySelection = useCallback(
    (items: WahaChatItem[]) => {
      const selected: WahaChatItem[] = [];
      const unselected: WahaChatItem[] = [];

      items.forEach(item => {
        if (selectedMap[item.w_id] === true) {
          selected.push(item);
        } else {
          unselected.push(item);
        }
      });

      return [...selected, ...unselected];
    },
    [selectedMap],
  );

  const filteredGroups = useMemo(() => {
    let result = groups;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = groups.filter(g => g.chat_name.toLowerCase().includes(q));
    }
    return sortBySelection(result);
  }, [query, groups, sortBySelection]);

  const filteredChats = useMemo(() => {
    let result = chats;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = chats.filter(g => g.chat_name.toLowerCase().includes(q));
    }
    return sortBySelection(result);
  }, [query, chats, sortBySelection]);

  const filtered = activeTab === 'groups' ? filteredGroups : filteredChats;

  const isSelected = useCallback(
    (w_id: string) => selectedMap[w_id] === true,
    [selectedMap],
  );

  const allSelected = useMemo(
    () => filtered.length > 0 && filtered.every(g => isSelected(g.w_id)),
    [filtered, isSelected],
  );

  const selectedCount = useMemo(
    () => allItems.filter(g => isSelected(g.w_id)).length,
    [allItems, isSelected],
  );

  const hasSelection = selectedCount > 0;
  const isButtonDisabled = selectedCount === 0;

  const handleTabChange = useCallback(
    (tab: TabType) => {
      if (tab === activeTab) return;
      setActiveTab(tab);
    },
    [activeTab],
  );

  const toggle = useCallback((w_id: string) => {
    setSelectedMap(prev => {
      const newVal = prev[w_id] === true ? false : true;
      setInteractedMap(p => ({ ...p, [w_id]: newVal }));
      return { ...prev, [w_id]: newVal };
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedMap(prev => {
      const allCurrentlySelected = filtered.every(g => prev[g.w_id] === true);
      const updates = Object.fromEntries(
        filtered.map(item => [item.w_id, !allCurrentlySelected]),
      );
      setInteractedMap(p => ({ ...p, ...updates }));
      return { ...prev, ...updates };
    });
  }, [filtered]);

  const handleContinue = useCallback(() => {
    if (isButtonDisabled) return;

    sessionStorage.setItem(
      'aira_selected_chats',
      JSON.stringify(interactedMap),
    );
    router.push(ROUTES.WHATSAPP_AI_ANALYSIS);
  }, [interactedMap, isButtonDisabled, router]);

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
        <motion.div
          className="flex flex-col items-center gap-6 text-center px-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_CONFIG, duration: 0.4 }}
        >
          {/* Animated SVG Illustration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_CONFIG, delay: 0.1 }}
          >
            <EmptyChatsIllustration />
          </motion.div>

          {/* Text content */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_CONFIG, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-foreground">
              No chats found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Sync your WhatsApp chats to get started with AiRA automation
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_CONFIG, delay: 0.3 }}
          >
            <Button
              onClick={() => syncChats.mutate()}
              disabled={syncChats.isPending}
              className="gap-2 min-w-[140px]"
            >
              <RefreshCw
                className={cn('h-4 w-4', syncChats.isPending && 'animate-spin')}
              />
              {syncChats.isPending ? 'Syncing...' : 'Sync Chats'}
            </Button>
            <Button
              onClick={() => router.push(ROUTES.HUB)}
              variant="outline"
              className="min-w-[140px]"
            >
              Go to Hub
            </Button>
          </motion.div>
        </motion.div>
      </ScreenLayout>
    );
  }

  return (
    <>
      <ScreenLayout maxWidth="md" className="flex flex-col py-4" padded={false}>
        <Header title={'Select Chats'} align={'center'} close={false} />
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => syncChats.mutate()}
                disabled={syncChats.isPending}
                className="flex items-center justify-center rounded-lg border border-border bg-card p-2 transition-colors hover:bg-accent/50 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn(
                    'h-5 w-5 text-primary',
                    syncChats.isPending && 'animate-spin',
                  )}
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center justify-center rounded-lg border border-border bg-card p-2 transition-colors hover:bg-accent/50"
              >
                {allSelected ? (
                  <ListX className="h-5 w-5 text-primary" strokeWidth={2} />
                ) : (
                  <ListChecks
                    className="h-5 w-5 text-primary"
                    strokeWidth={2}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Group List */}
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-0 pb-24">
              {filtered?.map((item, index) => (
                <ListItem
                  key={item.w_id}
                  item={item}
                  index={index}
                  selected={isSelected(item.w_id)}
                  onPress={() => toggle(item.w_id)}
                  isFirst={index === 0}
                  isLast={index === filtered?.length - 1}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </ScreenLayout>

      {/* Bottom Bar - Outside ScreenLayout for proper fixed positioning */}
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
                <span className="text-2xl font-bold text-foreground">
                  {selectedCount}
                </span>
                <span className="text-muted-foreground">selected</span>
              </div>

              <Button
                type="button"
                onClick={handleContinue}
                size="default"
                disabled={isButtonDisabled}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
