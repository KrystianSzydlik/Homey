'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import type { BottomSheetContextValue } from './types';

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

export function useBottomSheetContext() {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('BottomSheet components must be used within BottomSheet.Root');
  }
  return context;
}

interface BottomSheetProviderProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
  closeOnSwipeDown: boolean;
  maxHeight: string;
  children: ReactNode;
}

export function BottomSheetProvider({
  isOpen,
  onClose,
  closeOnOverlayClick,
  closeOnEscape,
  closeOnSwipeDown,
  maxHeight,
  children,
}: BottomSheetProviderProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <BottomSheetContext.Provider
      value={{
        isOpen,
        onClose,
        closeOnOverlayClick,
        closeOnEscape,
        closeOnSwipeDown,
        maxHeight,
        contentRef,
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
}
