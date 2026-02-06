'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { SuggestionStack } from '@/components/hub';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES, SPRING_CONFIG } from '@/lib/constants';
import {
  useSuggestions,
  useDeleteSuggestion,
  type Suggestion,
} from '@repo/core';

export default function SuggestionsPage() {
  const router = useRouter();
  const { data: suggestions = [], isLoading: isSuggestionsLoading } =
    useSuggestions();
  const { mutate: deleteSuggestion } = useDeleteSuggestion();
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<
    Set<string>
  >(new Set());

  // Filter suggestions based on dismissed state
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(
      suggestion => !dismissedSuggestionIds.has(suggestion._id),
    );
  }, [suggestions, dismissedSuggestionIds]);

  // Handle create rule from suggestion
  const handleCreateRule = useCallback(
    (suggestionId: string) => {
      const suggestion = suggestions.find(
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

  // Handle suggestion dismiss (left swipe or button)
  const handleDismiss = useCallback(
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
  const [reorderedIds, setReorderedIds] = useState<string[]>([]);

  const orderedSuggestions = useMemo(() => {
    const filtered = filteredSuggestions;
    if (reorderedIds.length === 0) return filtered;
    // Sort: items in reorderedIds go to the end in that order
    const backSet = new Set(reorderedIds);
    const front = filtered.filter(s => !backSet.has(s._id));
    const back = reorderedIds
      .map(id => filtered.find(s => s._id === id))
      .filter(Boolean) as typeof filtered;
    return [...front, ...back];
  }, [filteredSuggestions, reorderedIds]);

  const handleSendToBack = useCallback((suggestionId: string) => {
    setReorderedIds(prev => [
      ...prev.filter(id => id !== suggestionId),
      suggestionId,
    ]);
  }, []);

  // Calculate total suggestion count
  const totalSuggestionCount = orderedSuggestions.length;

  // Get unique chat count
  const uniqueChatCount = useMemo(() => {
    const chats = new Set<string>();
    orderedSuggestions.forEach(s => {
      s.chats.forEach(c => chats.add(c.w_id));
    });
    return chats.size;
  }, [orderedSuggestions]);

  const handleContinue = () => {
    router.push(ROUTES.HUB);
  };

  // Loading state
  if (isSuggestionsLoading) {
    return (
      <ScreenLayout maxWidth="md" className="flex flex-col py-4">
        <div className="flex flex-1 flex-col px-4">
          <div className="mb-6 text-center">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </ScreenLayout>
    );
  }

  // No suggestions state
  if (suggestions.length === 0) {
    return (
      <ScreenLayout
        maxWidth="md"
        className="flex min-h-[60vh] items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              No suggestions available
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              AiRA couldn&apos;t find any rule suggestions for your groups
            </p>
          </div>
          <Button onClick={() => router.push(ROUTES.HUB)} className="mt-2">
            Go to Hub
          </Button>
        </motion.div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout maxWidth="md" className="flex flex-col py-4" padded={false}>
      <div className="flex flex-1 flex-col px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">
              AiRA Suggest
            </h1>
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Swipe to dismiss or tap Create Rule
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex items-center justify-center gap-4 text-sm text-muted-foreground"
        >
          <span>All chats analyzed</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>
            {totalSuggestionCount} suggestion
            {totalSuggestionCount !== 1 ? 's' : ''} in {uniqueChatCount} chat
            {uniqueChatCount !== 1 ? 's' : ''}
          </span>
        </motion.div>

        {/* Suggestion Stack */}
        <div className="flex-1 pb-24">
          <SuggestionStack
            suggestions={orderedSuggestions}
            onCreateRule={handleCreateRule}
            onDismiss={handleDismiss}
            onSendToBack={handleSendToBack}
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING_CONFIG}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background px-4 pb-6 pt-4"
      >
        <div className="mx-auto max-w-md">
          <Button onClick={handleContinue} size="default" className="w-full">
            Continue to Hub
          </Button>
        </div>
      </motion.div>
    </ScreenLayout>
  );
}
