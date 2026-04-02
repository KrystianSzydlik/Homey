'use client';

import { PopoverProvider } from './PopoverContext';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverContent } from './PopoverContent';
import { PopoverHeader } from './PopoverHeader';
import { PopoverTitle } from './PopoverTitle';
import { PopoverCloseButton } from './PopoverCloseButton';
import { PopoverBody } from './PopoverBody';
import type { PopoverProps } from './types';

function PopoverRoot({ open, defaultOpen, onOpenChange, children }: PopoverProps) {
  return (
    <PopoverProvider
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </PopoverProvider>
  );
}

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Header: PopoverHeader,
  Title: PopoverTitle,
  CloseButton: PopoverCloseButton,
  Body: PopoverBody,
});
