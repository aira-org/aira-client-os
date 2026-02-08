'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, ListChecks, ListX, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useWahaGroups, useWahaSyncChats } from '@repo/core';
import type { WahaChatItem } from '@repo/core';

type TabType = 'groups' | 'chats';

interface AnimatedCheckboxProps {
  checked: boolean;
}

function AnimatedCheckbox({ checked }: AnimatedCheckboxProps) {
  return (
    <motion.div
      className={cn(
        'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
        checked
          ? 'border-primary bg-primary'
          : 'border-muted-foreground/30 bg-transparent',
      )}
      whileTap={{ scale: 0.9 }}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
        </motion.div>
      )}
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

  isLast,
}: ListItemProps) {
  const totalRules = item.num_active_rules + item.num_inactive_rules;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="relative"
    >
      <button
        onClick={onPress}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
          'hover:bg-accent/50',
          selected && 'bg-accent/30',
        )}
      >
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {(item.chat_name || '??').toUpperCase().slice(0, 2)}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="truncate font-medium text-foreground">
            {item.chat_name || 'Unknown Chat'}
          </div>
          <div className="text-xs text-muted-foreground">
            {totalRules} {totalRules === 1 ? 'rule' : 'rules'}
          </div>
        </div>

        {/* Checkbox */}
        <AnimatedCheckbox checked={selected} />
      </button>

      {/* Separator */}
      {!isLast && <div className="mx-4 h-px bg-border" />}
    </motion.div>
  );
}

export interface GroupSelectorCoreProps {
  /** Initial selection (w_ids) */
  initialSelected?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (selected: string[]) => void;
  /** Show tab switcher */
  showTabs?: boolean;
  /** Show sync button */
  showSync?: boolean;
  /** Show select all button */
  showSelectAll?: boolean;
  /** Show search */
  showSearch?: boolean;
  /** Custom class name */
  className?: string;
  /** Maximum height for the list */
  maxHeight?: string;
}

export function GroupSelectorCore({
  initialSelected = [],
  onSelectionChange,
  showTabs = true,
  showSync = true,
  showSelectAll = true,
  showSearch = true,
  className,
  maxHeight = '600px',
}: GroupSelectorCoreProps) {
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

  // Combine groups and chats
  const allItems = useMemo(() => {
    const uniqueItems = new Map<string, WahaChatItem>();
    groups.forEach(item => {
      uniqueItems.set(item.w_id, item);
    });
    chats.forEach(item => {
      if (!uniqueItems.has(item.w_id)) {
        uniqueItems.set(item.w_id, item);
      }
    });
    return Array.from(uniqueItems.values());
  }, [groups, chats]);

  // selectedMap: track selected items
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      initialSelected.forEach(id => {
        initial[id] = true;
      });
      // Auto-select items with moderation_status if no initial selection
      if (initialSelected.length === 0) {
        allItems.forEach(item => {
          if (item.moderation_status) {
            initial[item.w_id] = true;
          }
        });
      }
      return initial;
    },
  );

  // Notify parent of selection changes
  React.useEffect(() => {
    const selected = Object.entries(selectedMap)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    onSelectionChange?.(selected);
  }, [selectedMap, onSelectionChange]);

  // Sort function: selected items first
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

  const handleTabChange = useCallback(
    (tab: TabType) => {
      if (tab === activeTab) return;
      setActiveTab(tab);
    },
    [activeTab],
  );

  const toggle = useCallback((w_id: string) => {
    setSelectedMap(prev => ({
      ...prev,
      [w_id]: prev[w_id] === true ? false : true,
    }));
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedMap(prev => {
      const allCurrentlySelected = filtered.every(g => prev[g.w_id] === true);
      const updates = Object.fromEntries(
        filtered.map(item => [item.w_id, !allCurrentlySelected]),
      );
      return { ...prev, ...updates };
    });
  }, [filtered]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-muted-foreground">Loading chats...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('flex flex-col items-center gap-4 py-12', className)}>
        <div className="text-destructive">Failed to load chats</div>
        {showSync && (
          <Button
            onClick={() => syncChats.mutate()}
            disabled={syncChats.isPending}
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (groups.length === 0 && chats.length === 0) {
    return (
      <div className={cn('flex flex-col items-center gap-4 py-12', className)}>
        <div className="text-center">
          <div className="font-medium text-foreground">No chats found</div>
          <div className="text-sm text-muted-foreground">
            Sync your WhatsApp chats to get started
          </div>
        </div>
        {showSync && (
          <Button
            onClick={() => syncChats.mutate()}
            disabled={syncChats.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {syncChats.isPending ? 'Syncing...' : 'Sync Chats'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search Bar */}
      {showSearch && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4">
          <Search
            className={cn(
              'h-4 w-4 transition-colors',
              isSearchFocused ? 'text-primary' : 'text-muted-foreground',
            )}
          />
          <Input
            type="text"
            placeholder="Search chats..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-10 border-0 bg-transparent pl-0 outline-none! focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      )}

      {/* Tab Row */}
      {showTabs && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
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

          {showSync && (
            <button
              onClick={() => syncChats.mutate()}
              disabled={syncChats.isPending}
              className="flex items-center justify-center rounded-lg border border-border bg-card p-2 transition-colors hover:bg-accent/50 disabled:opacity-50"
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4 text-muted-foreground',
                  syncChats.isPending && 'animate-spin',
                )}
              />
            </button>
          )}
        </div>
      )}

      {/* Select All Button */}
      {showSelectAll && filtered.length > 0 && (
        <div className="flex justify-between px-4">
          <div className="text-sm text-muted-foreground">
            {selectedCount} selected
          </div>
          <button
            onClick={toggleAll}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {allSelected ? (
              <>
                <ListX className="h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <ListChecks className="h-4 w-4" />
                Select All
              </>
            )}
          </button>
        </div>
      )}

      {/* List */}
      <ScrollArea
        style={{ maxHeight }}
        className="rounded-lg border border-border"
      >
        <div className="bg-card">
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
  );
}
