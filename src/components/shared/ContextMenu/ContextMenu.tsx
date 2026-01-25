'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './ContextMenu.module.scss';

export interface Position {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: Position;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const menuVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export function ContextMenu({
  isOpen,
  position,
  onClose,
  children,
  className,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Delay to avoid closing immediately
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // SSR guard
  if (typeof window === 'undefined') return null;

  // Calculate adjusted position during render (without accessing refs)
  // This ensures the menu stays within viewport bounds
  const padding = 8;
  const menuWidth = 180; // min-width from CSS
  const menuHeight = 100; // approximate height

  let adjustedX = position.x;
  let adjustedY = position.y;

  if (typeof window !== 'undefined') {
    if (adjustedX + menuWidth > window.innerWidth - padding) {
      adjustedX = window.innerWidth - menuWidth - padding;
    }
    if (adjustedX < padding) {
      adjustedX = padding;
    }
    if (adjustedY + menuHeight > window.innerHeight - padding) {
      adjustedY = window.innerHeight - menuHeight - padding;
    }
    if (adjustedY < padding) {
      adjustedY = padding;
    }
  }

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="menu"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={menuVariants}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 400,
            duration: 0.15,
          }}
          className={`${styles.menu} ${className || ''}`}
          style={{
            position: 'fixed',
            top: adjustedY,
            left: adjustedX,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

// Compound component parts
export interface ContextMenuItemProps {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'warning' | 'danger';
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function ContextMenuItem({
  label,
  onClick,
  variant = 'default',
  disabled = false,
  icon,
}: ContextMenuItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      role="menuitem"
      className={`${styles.item} ${styles[variant]} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </button>
  );
}

export function ContextMenuSeparator() {
  return <div className={styles.separator} role="separator" />;
}
