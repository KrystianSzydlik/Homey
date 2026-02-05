'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePopoverContext } from './PopoverContext';
import { usePopoverPosition } from './usePopoverPosition';
import type { PopoverContentProps } from './types';
import styles from './Popover.module.scss';

const contentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
};

export function PopoverContent({
  align = 'center',
  side = 'bottom',
  sideOffset = 8,
  matchTriggerWidth = false,
  className,
  children,
}: PopoverContentProps) {
  const { isOpen, setIsOpen, triggerRef, contentRef, contentId } =
    usePopoverContext();

  const position = usePopoverPosition({
    triggerRef,
    contentRef,
    isOpen,
    align,
    side,
    sideOffset,
  });

  const triggerWidth =
    matchTriggerWidth && triggerRef.current
      ? triggerRef.current.offsetWidth
      : undefined;

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    // Delay to avoid closing immediately on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen, triggerRef, contentRef]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // SSR guard
  if (typeof window === 'undefined') return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={contentRef}
          id={contentId}
          role="dialog"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={contentVariants}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 400,
            duration: 0.2,
          }}
          className={`${styles.content} ${className || ''}`}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            ...(triggerWidth && { minWidth: `${triggerWidth}px` }),
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
