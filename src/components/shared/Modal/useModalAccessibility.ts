'use client';

import { useEffect, useCallback, type RefObject } from 'react';

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseModalAccessibilityOptions {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
}

export function useModalAccessibility({
  isOpen,
  onClose,
  closeOnEscape,
  contentRef,
}: UseModalAccessibilityOptions) {
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!contentRef.current) return [];
    return Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );
  }, [contentRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
          return;
        }

        if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
          return;
        }

        if (
          contentRef.current &&
          !contentRef.current.contains(document.activeElement)
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape, getFocusableElements, contentRef]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isOpen, getFocusableElements]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement as HTMLElement;

    return () => {
      if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen]);
}
