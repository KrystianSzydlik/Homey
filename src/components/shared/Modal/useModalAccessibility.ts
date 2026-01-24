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
  // Get all focusable elements within the modal
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!contentRef.current) return [];
    return Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );
  }, [contentRef]);

  // Handle keyboard events (Escape and Tab for focus trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      // Handle Tab key for focus trap
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab on first element -> focus last element
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
          return;
        }

        // Tab on last element -> focus first element
        if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
          return;
        }

        // If focus is outside modal, bring it back
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

  // Focus first focusable element when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure modal content is rendered
    const timeoutId = setTimeout(() => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isOpen, getFocusableElements]);

  // Store and restore focus when modal opens/closes
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement as HTMLElement;

    return () => {
      // Restore focus when modal closes
      if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen]);
}
