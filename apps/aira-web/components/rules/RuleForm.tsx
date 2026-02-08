'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Check,
  Trash2,
  FileText,
  HardDrive,
  Users,
  Clock,
  Search,
  Loader2,
  Zap,
} from 'lucide-react';
import { ScreenLayout } from '@/components/layout';
import { Textarea } from '@/components/ui/textarea';
import {
  SectionHeader,
  ConnectorSelector,
  GroupPickerCard,
  ScheduleSelector,
  GroupSelector,
  type Connector,
} from '@/components/editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  useRuleForm,
  type RuleFormValues,
  type RuleFormGroup,
} from '@/hooks/useRuleForm';
import { useUpdateWahaGroups } from '@repo/core';
import { useToast } from '@/components/ui/toast';

export interface RuleFormProps {
  mode: 'create' | 'edit';
  title: string;
  initialValues?: Partial<RuleFormValues>;
  connectors: Connector[];
  groups: RuleFormGroup[];
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onBack: () => void;
  onSubmit: (data: RuleFormValues) => void;
  onDelete?: () => void;
  onConnect?: (connectorId: string) => void;
}

export function RuleForm({
  mode,
  title,
  initialValues,
  connectors,
  groups,
  isSubmitting = false,
  isDeleting = false,
  onBack,
  onSubmit,
  onDelete,
  onConnect,
}: RuleFormProps) {
  const form = useRuleForm({
    initialValues,
    connectors,
    groups,
  });

  const isLoading = isSubmitting || isDeleting;
  const canSubmit = form.canSave && !isLoading;

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(form.getFormValues());
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const handleGroupPickerClose = (open: boolean) => {
    form.setShowGroupPicker(open);
    if (!open) form.resetGroupSearch();
  };

  // Moderation flow
  const { showToast } = useToast();
  const [isModerating, setIsModerating] = useState(false);
  const updateGroups = useUpdateWahaGroups({
    onJobStart: () => {
      // Job started in background, we can close and proceed
    },
    onJobComplete: message => {
      showToast(message ?? 'Groups moderated successfully!', 'success');
    },
  });

  // Compute which selected groups need moderation
  const inactiveSelectedGroups = useMemo(() => {
    return groups.filter(
      g => form.selectedGroups.includes(g.id) && !g.isModerated,
    );
  }, [groups, form.selectedGroups]);

  const hasInactiveSelection = inactiveSelectedGroups.length > 0;

  // Handler for "Moderate & Select" button
  const handleModerateAndSelect = useCallback(async () => {
    if (!hasInactiveSelection || isModerating) return;

    setIsModerating(true);

    // Build the moderation request: enable all inactive selected groups
    const chats: Record<string, boolean> = {};
    inactiveSelectedGroups.forEach(g => {
      chats[g.id] = true;
    });

    try {
      await updateGroups.mutateAsync({ chats });
      // On success, the groups are now moderated
      // Close the dialog
      form.setShowGroupPicker(false);
      form.resetGroupSearch();
      showToast(
        `${inactiveSelectedGroups.length} group(s) set up successfully!`,
        'success',
      );
    } catch (error) {
      console.error('Moderation failed:', error);
      showToast('Failed to set up groups. Please try again.', 'error');
    } finally {
      setIsModerating(false);
    }
  }, [
    hasInactiveSelection,
    isModerating,
    inactiveSelectedGroups,
    updateGroups,
    form,
    showToast,
  ]);

  // Filter connectors to only show suggested ones
  const suggestedConnectors = useMemo(
    () => connectors.filter(c => form.suggestedConnectorIds.includes(c.id)),
    [connectors, form.suggestedConnectorIds],
  );

  return (
    <ScreenLayout maxWidth="lg" className="relative min-h-screen pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {mode === 'edit' && onDelete ? (
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
          {/* Rule Instruction */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <SectionHeader
              title="Rule Instruction"
              icon={<FileText className="h-4.5 w-4.5 text-primary" />}
            />
            <div className="rounded-2xl border border-border bg-card p-3">
              <Textarea
                value={form.rawText}
                onChange={e => form.setRawText(e.target.value)}
                placeholder="Describe what this rule should do..."
                className="min-h-[100px] resize-none border-0 bg-transparent text-[15px] focus-visible:ring-0 p-3"
              />
              {form.matchedKeywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                  {form.matchedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-lg border border-primary/40 bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Connected Services */}
          {form.suggestedConnectorIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SectionHeader
                title="Connected Services"
                icon={<HardDrive className="h-4.5 w-4.5 text-primary" />}
              />
              <ConnectorSelector
                connectors={suggestedConnectors}
                selectedIds={form.selectedConnectors}
                suggestedIds={form.suggestedConnectorIds}
                onToggle={form.handleConnectorToggle}
                onIntegrate={onConnect}
              />
            </motion.div>
          )}

          {/* Apply to Groups */}
          {form.showGroupSelector && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SectionHeader
                title="Apply to Groups"
                icon={<Users className="h-4.5 w-4.5 text-primary" />}
              />
              <GroupPickerCard
                selectedCount={form.selectedGroups.length}
                onClick={() => form.setShowGroupPicker(true)}
              />
            </motion.div>
          )}

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SectionHeader
              title="Trigger Schedule"
              icon={<Clock className="h-4.5 w-4.5 text-primary" />}
            />
            <ScheduleSelector
              isEnabled={form.scheduleEnabled}
              onToggle={form.setScheduleEnabled}
              time={form.scheduleTime}
              onTimeChange={form.setScheduleTime}
              interval={form.scheduleInterval}
              onIntervalChange={form.setScheduleInterval}
            />
          </motion.div>
        </div>

        {/* Bottom Save Button */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background px-5 py-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'w-full rounded-2xl py-6 text-base font-semibold',
              !canSubmit && 'opacity-50',
            )}
          >
            <Check className="mr-2 h-5 w-5" />
            {isSubmitting
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
                ? 'Create Rule'
                : 'Save Changes'}
          </Button>
        </div>
      </motion.div>

      {/* Group Picker Dialog */}
      <Dialog open={form.showGroupPicker} onOpenChange={handleGroupPickerClose}>
        <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Groups & Chats</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={form.groupSearchQuery}
              onChange={e => form.setGroupSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            <GroupSelector
              groups={form.filteredGroups}
              selected={form.selectedGroups}
              onChange={form.setSelectedGroups}
              label="WhatsApp Groups & Chats"
            />
          </div>
          <div className="flex items-center justify-between pt-4">
            {/* Moderate & Select button - only visible when inactive groups are selected */}
            {hasInactiveSelection ? (
              <Button
                variant="outline"
                onClick={handleModerateAndSelect}
                disabled={isModerating}
                className="gap-2"
              >
                {isModerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isModerating
                  ? 'Setting up...'
                  : `Set up ${inactiveSelectedGroups.length}`}
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={() => form.setShowGroupPicker(false)}>
              Done ({form.selectedGroups.length} selected)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (Edit mode only) */}
      {mode === 'edit' && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Rule</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this rule? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ScreenLayout>
  );
}

export type { RuleFormValues, RuleFormGroup };
