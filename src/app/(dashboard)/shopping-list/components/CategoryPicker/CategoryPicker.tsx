'use client';

import { useState, useRef, useEffect } from 'react';
import { ShoppingCategory } from '@prisma/client';
import { CATEGORIES } from '@/config/shopping';
import styles from './CategoryPicker.module.scss';

interface CategoryPickerProps {
  currentCategory: ShoppingCategory;
  onSelect: (category: ShoppingCategory) => void;
}

export default function CategoryPicker({
  currentCategory,
  onSelect,
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory =
    CATEGORIES.find((c) => c.value === currentCategory) ||
    CATEGORIES.find((c) => c.value === 'OTHER')!;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles.triggerContent}>
          <span className={styles.emoji}>{selectedCategory.emoji}</span>
          <span className={styles.label}>{selectedCategory.label}</span>
        </div>
        <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.content}>
            {CATEGORIES.filter((c) => c.value !== 'ALL').map((category) => (
              <button
                key={category.value}
                type="button"
                className={`${styles.option} ${
                  currentCategory === category.value ? styles.active : ''
                }`}
                onClick={() => {
                  onSelect(category.value as ShoppingCategory);
                  setIsOpen(false);
                }}
              >
                <span className={styles.optionEmoji}>{category.emoji}</span>
                <span className={styles.optionLabel}>{category.label}</span>
                {currentCategory === category.value && (
                  <span className={styles.check}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
