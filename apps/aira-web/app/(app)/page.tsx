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
  useRules,
  useUpdateRule,
  type Suggestion,
} from '@repo/core';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { RuleItem } from '@/components/workspace';
import { deriveChatCount, deriveToggleStatusText } from '@/lib/rule-utils';
import { Plus } from 'lucide-react';

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
    searchParams.get('tab') || 'actions',
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

  // Rules data
  const { data: rulesData, isLoading: isLoadingRules } = useRules();
  const { mutate: updateRule } = useUpdateRule();

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
      if (tabId === 'actions') {
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
    activeTab === 'actions' ? filteredCards.length + orderedSuggestions.length : rulesData?.length || 0;

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
            {activeTab === 'actions' ? 'Your Inbox' : 'Workspace Rules'}
          </h2>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          activeCategory={activeTab}
          onCategoryChange={handleTabChange}
        />

        {/* Content - Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {isLoadingRules && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            )}
            
            {!isLoadingRules && rulesData && rulesData.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {rulesData.length} active rules
                  </span>
                  <button 
                    onClick={() => router.push(ROUTES.RULES_NEW)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    + New Rule
                  </button>
                </div>
                {rulesData.map((rule, index) => (
                  <motion.div
                    key={rule.rule_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RuleItem
                      id={rule.rule_id}
                      title={rule.raw_text.slice(0, 40) + (rule.raw_text.length > 40 ? '...' : '')}
                      description={rule.raw_text}
                      connectorType="whatsapp"
                      isEnabled={rule.status === 'active'}
                      onToggle={() => {
                        const newStatus = rule.status === 'active' ? 'inactive' : 'active';
                        updateRule({
                          rule_id: rule.rule_id,
                          w_id: rule.w_id,
                          raw_text: rule.raw_text,
                          status: newStatus,
                        });
                      }}
                      onClick={() => router.push(ROUTES.RULES_EDIT(rule.rule_id))}
                      onStatusClick={() => router.push(ROUTES.RULES_EDIT(rule.rule_id))}
                      chatCount={deriveChatCount(rule)}
                      statusText={deriveToggleStatusText(rule)}
                      lastRun={rule.last_triggered_at ? formatRelativeTime(rule.last_triggered_at) : undefined}
                    />
                  </motion.div>
                ))}
              </div>
            ) : !isLoadingRules && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">No rules found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first automation rule to get started</p>
                <Button onClick={() => router.push(ROUTES.RULES_NEW)}>
                  Create Rule
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Content - Actions Tab (Merged Tasks & Suggestions) */}
        {activeTab === 'actions' && (
          <div className="space-y-8">
            {/* Quick Actions Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Actions ({filteredCards.length})
                </h3>
              </div>
              
              {isLoadingTasks ? (
                <div className="space-y-4">
                  {[1].map(i => (
                    <Skeleton key={i} className="h-80 w-full rounded-xl" />
                  ))}
                </div>
              ) : filteredCards.length > 0 ? (
                <CardStack
                  cards={filteredCards}
                  onSendMessage={handleSendMessage}
                  onDismiss={handleDismiss}
                />
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No urgent tasks</p>
                </div>
              )}
            </div>

            {/* Suggestions Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Suggestions ({orderedSuggestions.length})
                </h3>
              </div>

              {isLoadingSuggestions ? (
                <div className="space-y-4">
                  {[1].map(i => (
                    <Skeleton key={i} className="h-80 w-full rounded-xl" />
                  ))}
                </div>
              ) : orderedSuggestions.length > 0 ? (
                <SuggestionStack
                  suggestions={orderedSuggestions}
                  onCreateRule={handleCreateRule}
                  onDismiss={handleSuggestionDismiss}
                  onSendToBack={handleSuggestionSendToBack}
                />
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">Checking for new insights...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </ScreenLayout>
  );
}
