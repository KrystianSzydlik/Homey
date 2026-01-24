'use client';

import { useState } from 'react';
import { ShoppingCategory } from '@prisma/client';
import { Popover } from '@/components/shared/Popover';
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

  const selectedCategory =
    CATEGORIES.find((c) => c.value === currentCategory) ||
    CATEGORIES.find((c) => c.value === 'OTHER')!;

  const handleCategorySelect = (category: ShoppingCategory) => {
    onSelect(category);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger className={styles.trigger}>
        <div className={styles.triggerContent}>
          <span className={styles.emoji}>{selectedCategory.emoji}</span>
          <span className={styles.label}>{selectedCategory.label}</span>
        </div>
        <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
      </Popover.Trigger>

      <Popover.Content align="start" sideOffset={8} className={styles.popover}>
        <Popover.Body className={styles.content}>
          {CATEGORIES.filter((c) => c.value !== 'ALL').map((category) => (
            <button
              key={category.value}
              type="button"
              className={`${styles.option} ${
                currentCategory === category.value ? styles.active : ''
              }`}
              onClick={() =>
                handleCategorySelect(category.value as ShoppingCategory)
              }
            >
              <span className={styles.optionEmoji}>{category.emoji}</span>
              <span className={styles.optionLabel}>{category.label}</span>
              {currentCategory === category.value && (
                <span className={styles.check}>✓</span>
              )}
            </button>
          ))}
        </Popover.Body>
      </Popover.Content>
    </Popover>
  );
}
