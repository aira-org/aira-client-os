'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScreenLayout } from '@/components/layout';
import {
  HubHeader,
  CategoryTabs,
  CardStack,
  SuggestionStack,
} from '@/components/hub';
import type { CardData, MessageCardData } from '@/components/hub';
import {
  useApexTasks,
  useSubmitApexTask,
  useUser,
  useSuggestions,
  useDeleteSuggestion,
  type Suggestion,
} from '@repo/core';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export default function HubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'tasks',
  );
  const [dismissedCardIds, setDismissedCardIds] = useState<Set<string>>(
    new Set(),
  );
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<
    Set<string>
  >(new Set());

  // Fetch user data
  const { data: user } = useUser();

  // Fetch apex tasks
  const { data: apexTasks, isLoading: isLoadingTasks } = useApexTasks();

  // Fetch suggestions
  const { data: suggestions, isLoading: isLoadingSuggestions } =
    useSuggestions();

  // Submit task mutation
  const { mutate: submitTask } = useSubmitApexTask();

  // Delete suggestion mutation
  const { mutate: deleteSuggestion } = useDeleteSuggestion();

  // Transform API tasks to CardData format (matching mobile app)
  const cards: CardData[] = useMemo(() => {
    if (!apexTasks) return [];

    return apexTasks.map(
      (task): MessageCardData => ({
        id: task.task_id,
        type: 'message',
        title: task.task_description,
        subtitle: task.task_message,
        category: task.task_category.toLowerCase(),
        timestamp: formatRelativeTime(task.last_updated_at),
        recipient: task.whatsapp_chat_id || 'Unknown',
        platform: 'whatsapp',
      }),
    );
  }, [apexTasks]);

  // Filter cards based on search and dismissed state
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Filter out dismissed cards
      if (dismissedCardIds.has(card.id)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          card.title.toLowerCase().includes(query) ||
          (card.subtitle?.toLowerCase().includes(query) ?? false)
        );
      }

      return true;
    });
  }, [cards, searchQuery, dismissedCardIds]);

  // Filter suggestions based on dismissed state
  const filteredSuggestions = useMemo(() => {
    if (!suggestions) return [];
    return suggestions.filter(
      suggestion => !dismissedSuggestionIds.has(suggestion._id),
    );
  }, [suggestions, dismissedSuggestionIds]);

  // Handle sending message
  const handleSendMessage = useCallback(
    (
      taskId: string,
      message: string,
      attachments: Array<
        | { id: string; type: 'image'; file: File; preview: string }
        | {
            id: string;
            type: 'audio';
            file: File;
            url: string;
            duration: number;
          }
      >,
    ) => {
      // Find image and audio attachments
      const imageAttachment = attachments.find(a => a.type === 'image') as
        | { id: string; type: 'image'; file: File; preview: string }
        | undefined;
      const audioAttachment = attachments.find(a => a.type === 'audio') as
        | {
            id: string;
            type: 'audio';
            file: File;
            url: string;
            duration: number;
          }
        | undefined;

      submitTask(
        {
          taskId,
          message: message || undefined,
          image: imageAttachment?.file,
          audio: audioAttachment?.file,
        },
        {
          onSuccess: () => {
            console.log('Task submitted:', taskId);
          },
          onError: error => {
            console.error('Failed to submit task:', error);
          },
        },
      );
    },
    [submitTask],
  );

  // Handle tab change — persist in URL so it survives navigation
  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === 'tasks') {
        params.delete('tab');
      } else {
        params.set('tab', tabId);
      }
      const query = params.toString();
      router.replace(query ? `?${query}` : '/', { scroll: false });
    },
    [searchParams, router],
  );

  // Handle card dismiss (swipe)
  const handleDismiss = useCallback((cardId: string, _direction: number) => {
    setDismissedCardIds(prev => new Set(prev).add(cardId));
  }, []);

  // Handle suggestion dismiss (left swipe or button)
  const handleSuggestionDismiss = useCallback(
    (suggestionId: string) => {
      setDismissedSuggestionIds(prev => new Set(prev).add(suggestionId));
      deleteSuggestion(suggestionId, {
        onError: error => {
          console.error('Failed to delete suggestion:', error);
        },
      });
    },
    [deleteSuggestion],
  );

  // Handle send-to-back (right swipe) — move to end of local order
  const [reorderedSuggestionIds, setReorderedSuggestionIds] = useState<
    string[]
  >([]);

  const orderedSuggestions = useMemo(() => {
    const filtered = filteredSuggestions;
    if (reorderedSuggestionIds.length === 0) return filtered;
    const backSet = new Set(reorderedSuggestionIds);
    const front = filtered.filter(s => !backSet.has(s._id));
    const back = reorderedSuggestionIds
      .map(id => filtered.find(s => s._id === id))
      .filter(Boolean) as typeof filtered;
    return [...front, ...back];
  }, [filteredSuggestions, reorderedSuggestionIds]);

  const handleSuggestionSendToBack = useCallback((suggestionId: string) => {
    setReorderedSuggestionIds(prev => [
      ...prev.filter(id => id !== suggestionId),
      suggestionId,
    ]);
  }, []);

  const pendingCount =
    activeTab === 'tasks' ? filteredCards.length : orderedSuggestions.length;

  // Handle create rule from suggestion
  const handleCreateRule = useCallback(
    (suggestionId: string) => {
      const suggestion = suggestions?.find(
        (s: Suggestion) => s._id === suggestionId,
      );
      if (suggestion) {
        const params = new URLSearchParams({
          suggestion: suggestion.display_rule,
          chatIds: suggestion.chats.map(c => c.w_id).join(','),
          suggestion_id: suggestion._id,
        });
        router.push(`${ROUTES.RULES_NEW}?${params.toString()}`);
      }
    },
    [suggestions, router],
  );

  // Get user's first name or fallback to 'there'
  const userName = user?.f_n || 'there';
const suggestionCount = 2

  return (
    <ScreenLayout maxWidth="xl" className="py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <HubHeader
          userName={userName}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearchFocused={isSearchFocused}
          onSearchFocus={() => setIsSearchFocused(true)}
          onSearchBlur={() => setIsSearchFocused(false)}
        />

        {/* Section header */}
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {activeTab === 'tasks' ? 'Pending Tasks' : 'Suggestions'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {pendingCount} {activeTab === 'tasks' ? 'workflow' : 'suggestion'}
            {pendingCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          activeCategory={activeTab}
            suggestionCount={suggestionCount}
          onCategoryChange={handleTabChange}
        />

        {/* Loading State */}
        {activeTab === 'tasks' && isLoadingTasks && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        )}

        {activeTab === 'suggestions' && isLoadingSuggestions && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Tasks Card Stack */}
        {activeTab === 'tasks' && !isLoadingTasks && (
          <CardStack
            cards={filteredCards}
            onSendMessage={handleSendMessage}
            onDismiss={handleDismiss}
          />
        )}

        {/* Suggestions Stack */}
        {activeTab === 'suggestions' && !isLoadingSuggestions && (
          <SuggestionStack
            suggestions={orderedSuggestions}
            onCreateRule={handleCreateRule}
            onDismiss={handleSuggestionDismiss}
            onSendToBack={handleSuggestionSendToBack}
          />
        )}
      </motion.div>
    </ScreenLayout>
  );
}
