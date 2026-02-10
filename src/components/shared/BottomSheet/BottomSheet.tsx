'use client';

import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useBodyOverflow } from '@/hooks/useBodyOverflow';
import { BottomSheetProvider, useBottomSheetContext } from './BottomSheetContext';
import { useBottomSheetAccessibility } from './useBottomSheetAccessibility';
import { BottomSheetOverlay } from './BottomSheetOverlay';
import { BottomSheetContent } from './BottomSheetContent';
import { BottomSheetHandle } from './BottomSheetHandle';
import { BottomSheetHeader } from './BottomSheetHeader';
import { BottomSheetTitle } from './BottomSheetTitle';
import { BottomSheetCloseButton } from './BottomSheetCloseButton';
import { BottomSheetBody } from './BottomSheetBody';
import { BottomSheetFooter } from './BottomSheetFooter';
import { BottomSheetCancelButton } from './BottomSheetCancelButton';
import { BottomSheetConfirmButton } from './BottomSheetConfirmButton';
import type { BottomSheetProps } from './types';
import styles from './BottomSheet.module.scss';

// Internal component to handle accessibility within the context
function BottomSheetAccessibilityHandler({ children }: { children: React.ReactNode }) {
  const { isOpen, onClose, closeOnEscape, contentRef } = useBottomSheetContext();

  useBottomSheetAccessibility({
    isOpen,
    onClose,
    closeOnEscape,
    contentRef,
  });

  return <>{children}</>;
}

function BottomSheetRoot({
  isOpen,
  onClose,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  closeOnSwipeDown = true,
  preventScroll = true,
  maxHeight = '90vh',
  children,
}: BottomSheetProps) {
  useBodyOverflow(preventScroll && isOpen);

  // SSR guard
  if (typeof window === 'undefined') return null;

  const sheetContent = (
    <BottomSheetProvider
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
      closeOnSwipeDown={closeOnSwipeDown}
      maxHeight={maxHeight}
    >
      <BottomSheetAccessibilityHandler>
        <AnimatePresence>
          {isOpen && <div className={styles.wrapper}>{children}</div>}
        </AnimatePresence>
      </BottomSheetAccessibilityHandler>
    </BottomSheetProvider>
  );

  return createPortal(sheetContent, document.body);
}

// Compound component with subcomponents attached
export const BottomSheet = Object.assign(BottomSheetRoot, {
  Overlay: BottomSheetOverlay,
  Content: BottomSheetContent,
  Handle: BottomSheetHandle,
  Header: BottomSheetHeader,
  Title: BottomSheetTitle,
  CloseButton: BottomSheetCloseButton,
  Body: BottomSheetBody,
  Footer: BottomSheetFooter,
  CancelButton: BottomSheetCancelButton,
  ConfirmButton: BottomSheetConfirmButton,
});
