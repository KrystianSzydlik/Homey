'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isNode } from '@/app/lib/utils/dom-type-guards';
import styles from './DropdownMenu.module.scss';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'warning' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  disabled?: boolean;
}

interface MenuPosition {
  top: number;
  left: number;
  openDirection: 'down' | 'up';
}

const VIEWPORT_PADDING = 8;
const TRIGGER_GAP = 8;
const DEFAULT_MENU_WIDTH = 180;
const DEFAULT_MENU_HEIGHT = 200;

function computePosition(
  triggerRect: DOMRect,
  align: 'left' | 'right',
  menuWidth: number = DEFAULT_MENU_WIDTH,
  menuHeight: number = DEFAULT_MENU_HEIGHT
): MenuPosition {
  // Vertical: prefer opening downward, flip if not enough space
  const spaceBelow = window.innerHeight - triggerRect.bottom - TRIGGER_GAP;
  const spaceAbove = triggerRect.top - TRIGGER_GAP;
  const openDirection: 'down' | 'up' =
    spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? 'down' : 'up';

  const top =
    openDirection === 'down'
      ? triggerRect.bottom + TRIGGER_GAP
      : triggerRect.top - TRIGGER_GAP - menuHeight;

  // Horizontal: align to trigger, then clamp to viewport
  let left: number;
  if (align === 'right') {
    left = triggerRect.right - menuWidth;
  } else {
    left = triggerRect.left;
  }
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - menuWidth - VIEWPORT_PADDING)
  );

  return { top, left, openDirection };
}

export default function DropdownMenu({
  items,
  align = 'right',
  disabled = false,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    openDirection: 'down',
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleCloseWithFocus = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Close on click outside, resize, scroll
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = isNode(event.target) ? event.target : null;
      if (
        target &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleClose);
    window.addEventListener('scroll', handleClose, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [isOpen, handleClose]);

  // Refine position after menu DOM is painted (actual dimensions available)
  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current || !buttonRef.current) return;

    const triggerRect = buttonRef.current.getBoundingClientRect();
    const menuEl = menuRef.current;
    // Fall back to defaults if DOM reports zero dimensions (e.g. animation not yet painted)
    const menuWidth = menuEl.offsetWidth || DEFAULT_MENU_WIDTH;
    const menuHeight = menuEl.offsetHeight || DEFAULT_MENU_HEIGHT;
    const refined = computePosition(triggerRect, align, menuWidth, menuHeight);
    setPosition(refined);
  }, [isOpen, align]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleCloseWithFocus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleCloseWithFocus]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen && buttonRef.current) {
      // Compute initial position synchronously before opening
      const triggerRect = buttonRef.current.getBoundingClientRect();
      setPosition(computePosition(triggerRect, align));
    }
    setIsOpen((prev) => !prev);
  };

  const animationOrigin = position.openDirection === 'down' ? -10 : 10;

  return (
    <div className={styles.container}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.active : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-label="More actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </button>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={menuRef}
              className={styles.menu}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: 9999,
              }}
              initial={{ opacity: 0, scale: 0.95, y: animationOrigin }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: animationOrigin }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              role="menu"
              aria-orientation="vertical"
            >
              {items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.menuItem} ${
                    item.variant ? styles[item.variant] : ''
                  } ${item.disabled ? styles.disabled : ''}`}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className={styles.icon}>{item.icon}</span>
                  )}
                  <span className={styles.label}>{item.label}</span>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
