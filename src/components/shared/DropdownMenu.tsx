'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function DropdownMenu({
  items,
  align = 'right',
  disabled = false,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            className={`${styles.menu} ${styles[align]}`}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
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
                {item.icon && <span className={styles.icon}>{item.icon}</span>}
                <span className={styles.label}>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
