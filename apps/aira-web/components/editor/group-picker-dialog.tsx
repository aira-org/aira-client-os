'use client';

import React from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GroupSelector } from './group-selector';

export interface GroupPickerGroup {
  id: string;
  name: string;
  memberCount?: number;
  rulesCount?: number;
}

interface GroupPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: GroupPickerGroup[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function GroupPickerDialog({
  open,
  onOpenChange,
  groups,
  selected,
  onSelectionChange,
  searchQuery,
  onSearchChange,
}: GroupPickerDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) onSearchChange('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Groups & Chats</DialogTitle>
        </DialogHeader>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <GroupSelector
            groups={groups}
            selected={selected}
            onChange={onSelectionChange}
            label="WhatsApp Groups & Chats"
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Done ({selected.length} selected)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
