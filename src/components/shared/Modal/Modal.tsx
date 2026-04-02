'use client';

import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useBodyOverflow } from '@/hooks/useBodyOverflow';
import { ModalProvider, useModalContext } from './ModalContext';
import { useModalAccessibility } from './useModalAccessibility';
import { ModalOverlay } from './ModalOverlay';
import { ModalContent } from './ModalContent';
import { ModalHeader } from './ModalHeader';
import { ModalTitle } from './ModalTitle';
import { ModalCloseButton } from './ModalCloseButton';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalCancelButton } from './ModalCancelButton';
import { ModalConfirmButton } from './ModalConfirmButton';
import type { ModalProps } from './types';
import styles from './Modal.module.scss';

function ModalAccessibilityHandler({ children }: { children: React.ReactNode }) {
  const { isOpen, onClose, closeOnEscape, contentRef } = useModalContext();

  useModalAccessibility({
    isOpen,
    onClose,
    closeOnEscape,
    contentRef,
  });

  return <>{children}</>;
}

function ModalRoot({
  isOpen,
  onClose,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  children,
}: ModalProps) {
  useBodyOverflow(preventScroll && isOpen);

  if (typeof window === 'undefined') return null;

  const modalContent = (
    <ModalProvider
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
    >
      <ModalAccessibilityHandler>
        <AnimatePresence>
          {isOpen && <div className={styles.wrapper}>{children}</div>}
        </AnimatePresence>
      </ModalAccessibilityHandler>
    </ModalProvider>
  );

  return createPortal(modalContent, document.body);
}

export const Modal = Object.assign(ModalRoot, {
  Overlay: ModalOverlay,
  Content: ModalContent,
  Header: ModalHeader,
  Title: ModalTitle,
  CloseButton: ModalCloseButton,
  Body: ModalBody,
  Footer: ModalFooter,
  CancelButton: ModalCancelButton,
  ConfirmButton: ModalConfirmButton,
});
