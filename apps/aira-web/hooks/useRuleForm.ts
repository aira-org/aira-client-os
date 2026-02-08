'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Connector, IntervalType } from '@/components/editor';
import { getSuggestedConnectorIds, detectKeywords } from '@/lib/utils';
import { ServiceConnector } from '@/lib/constants';

// Types
export interface RuleFormValues {
  rawText: string;
  selectedGroups: string[];
  scheduleEnabled: boolean;
  scheduleTime: string;
  scheduleInterval: IntervalType;
}

export interface RuleFormGroup {
  id: string;
  name: string;
  rulesCount: number;
  isModerated: boolean;
}

export interface UseRuleFormOptions {
  initialValues?: Partial<RuleFormValues>;
  connectors: Connector[];
  groups: RuleFormGroup[];
}

export interface UseRuleFormReturn {
  // Form values
  rawText: string;
  setRawText: (value: string) => void;
  selectedGroups: string[];
  setSelectedGroups: (value: string[]) => void;
  scheduleEnabled: boolean;
  setScheduleEnabled: (value: boolean) => void;
  scheduleTime: string;
  setScheduleTime: (value: string) => void;
  scheduleInterval: IntervalType;
  setScheduleInterval: (value: IntervalType) => void;

  // Dialog state
  showGroupPicker: boolean;
  setShowGroupPicker: (value: boolean) => void;
  groupSearchQuery: string;
  setGroupSearchQuery: (value: string) => void;

  // Derived state
  suggestedConnectorIds: string[];
  matchedKeywords: string[];
  selectedConnectors: string[];
  showGroupSelector: boolean;
  filteredGroups: RuleFormGroup[];
  canSave: boolean;

  // Handlers
  handleConnectorToggle: (id: string) => void;
  getFormValues: () => RuleFormValues;
  resetGroupSearch: () => void;
}

export function useRuleForm({
  initialValues,
  connectors,
  groups,
}: UseRuleFormOptions): UseRuleFormReturn {
  // Form state
  const [rawText, setRawText] = useState(initialValues?.rawText ?? '');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    initialValues?.selectedGroups ?? [],
  );
  const [scheduleEnabled, setScheduleEnabled] = useState(
    initialValues?.scheduleEnabled ?? false,
  );
  const [scheduleTime, setScheduleTime] = useState(
    initialValues?.scheduleTime ?? '09:00',
  );
  const [scheduleInterval, setScheduleInterval] = useState<IntervalType>(
    initialValues?.scheduleInterval ?? 'none',
  );

  // Dialog state
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  // Derived state
  const suggestedConnectorIds = useMemo(
    () => getSuggestedConnectorIds(rawText),
    [rawText],
  );

  const matchedKeywords = useMemo(() => detectKeywords(rawText), [rawText]);

  const selectedConnectors = useMemo(() => {
    const connectedIds = connectors.filter(c => c.isConnected).map(c => c.id);
    return suggestedConnectorIds.filter(id => connectedIds.includes(id));
  }, [suggestedConnectorIds, connectors]);

  const showGroupSelector = selectedConnectors.includes(
    ServiceConnector.WHATSAPP,
  );

  const filteredGroups = useMemo(() => {
    if (!groupSearchQuery.trim()) return groups;
    const q = groupSearchQuery.trim().toLowerCase();
    return groups.filter(
      g => g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q),
    );
  }, [groups, groupSearchQuery]);

  const canSave =
    rawText.trim().length > 0 &&
    (showGroupSelector ? selectedGroups.length > 0 : true) &&
    (scheduleEnabled ? scheduleInterval !== 'none' : true);

  // Handlers
  const handleConnectorToggle = useCallback((_id: string) => {
    // No-op: connected services that are suggested are automatically selected
  }, []);

  const getFormValues = useCallback(
    (): RuleFormValues => ({
      rawText,
      selectedGroups,
      scheduleEnabled,
      scheduleTime,
      scheduleInterval,
    }),
    [rawText, selectedGroups, scheduleEnabled, scheduleTime, scheduleInterval],
  );

  const resetGroupSearch = useCallback(() => {
    setGroupSearchQuery('');
  }, []);

  return {
    // Form values
    rawText,
    setRawText,
    selectedGroups,
    setSelectedGroups,
    scheduleEnabled,
    setScheduleEnabled,
    scheduleTime,
    setScheduleTime,
    scheduleInterval,
    setScheduleInterval,

    // Dialog state
    showGroupPicker,
    setShowGroupPicker,
    groupSearchQuery,
    setGroupSearchQuery,

    // Derived state
    suggestedConnectorIds,
    matchedKeywords,
    selectedConnectors,
    showGroupSelector,
    filteredGroups,
    canSave,

    // Handlers
    handleConnectorToggle,
    getFormValues,
    resetGroupSearch,
  };
}
