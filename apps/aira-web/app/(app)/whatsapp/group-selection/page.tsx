'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import Header from '@/components/ui/header';
import { GroupSelectorCore } from '@/components/group-selector/GroupSelectorCore';

type ConnectionSource = 'fresh_connection' | 'existing_connection';

export default function WhatsAppGroupSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const _source = searchParams.get('source') as ConnectionSource | null;
  const suggestion = searchParams.get('suggestion') ?? '';
  const from = searchParams.get('from');
  const ruleId = searchParams.get('ruleId') ?? '';

  const [selectedWIds, setSelectedWIds] = useState<string[]>([]);

  const hasSelection = selectedWIds.length > 0;
  const isButtonDisabled = selectedWIds.length === 0;

  const handleContinue = useCallback(() => {
    if (isButtonDisabled) return;

    // Convert array to object format for backward compatibility
    const interactedMap = Object.fromEntries(
      selectedWIds.map(id => [id, true]),
    );

    sessionStorage.setItem(
      'aira_selected_chats',
      JSON.stringify(interactedMap),
    );
    if (from === 'edit-rule' && ruleId) {
      const params = new URLSearchParams();
      params.set('select-group', '');

      router.push(`${ROUTES.RULES_EDIT(ruleId)}?${params.toString()}`);
    } else if (from === 'new-rule') {
      const params = new URLSearchParams();
      // value param (only if present)
      params.set('select-group', '');
      if (suggestion) {
        params.set('suggestion', suggestion);
      }

      router.push(`${ROUTES.RULES_NEW}?${params.toString()}`);
    } else {
      router.push(ROUTES.WHATSAPP_AI_ANALYSIS);
    }
  }, [selectedWIds, isButtonDisabled, router, from, suggestion, ruleId]);

  return (
    <>
      <ScreenLayout maxWidth="lg" className="flex flex-col py-4" padded={false}>
        <Header title={'Select Chats'} align={'center'} close={false} />
        <div className="flex flex-col gap-4 pb-24">
          <GroupSelectorCore
            onSelectionChange={setSelectedWIds}
            showTabs={true}
            showSync={true}
            showSelectAll={true}
            showSearch={true}
            maxHeight="calc(100vh - 280px)"
          />
        </div>
      </ScreenLayout>

      {/* Bottom Bar - Outside ScreenLayout for proper fixed positioning */}
      {hasSelection && (
        <AnimatePresence>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="container flex items-center justify-between gap-4 py-4">
              <div className="text-sm font-medium text-muted-foreground">
                {selectedWIds.length} selected
              </div>
              <Button
                onClick={handleContinue}
                disabled={isButtonDisabled}
                size="lg"
                className="min-w-[120px]"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
