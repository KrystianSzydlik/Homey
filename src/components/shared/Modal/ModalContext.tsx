'use client';

import { createContext, useContext, useId, useRef } from 'react';
import type { ModalContextValue } from './types';

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      'Modal compound components must be used within a Modal component'
    );
  }
  return context;
}

interface ModalProviderProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
  children: React.ReactNode;
}

export function ModalProvider({
  isOpen,
  onClose,
  closeOnOverlayClick,
  closeOnEscape,
  children,
}: ModalProviderProps) {
  const id = useId();
  const contentRef = useRef<HTMLDivElement>(null);

  const value: ModalContextValue = {
    isOpen,
    onClose,
    closeOnOverlayClick,
    closeOnEscape,
    titleId: `modal-title-${id}`,
    descriptionId: `modal-description-${id}`,
    contentRef,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}
