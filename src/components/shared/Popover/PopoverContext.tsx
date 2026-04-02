'use client';

import { createContext, useContext, useId, useRef, useState } from 'react';
import type { PopoverContextValue, PopoverProps } from './types';

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(
      'Popover compound components must be used within a Popover component'
    );
  }
  return context;
}

export function PopoverProvider({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: PopoverProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const value: PopoverContextValue = {
    isOpen,
    setIsOpen,
    triggerRef,
    contentRef,
    contentId: `popover-content-${id}`,
  };

  return (
    <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
  );
}
