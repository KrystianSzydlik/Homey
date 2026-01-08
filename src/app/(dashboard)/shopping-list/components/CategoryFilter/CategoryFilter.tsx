'use client';

import { ShoppingCategory } from '@prisma/client';
import styles from './CategoryFilter.module.scss';

const CATEGORIES: { value: ShoppingCategory | 'ALL'; label: string; emoji: string }[] = [
  { value: 'ALL', label: 'All', emoji: '📋' },
  { value: 'VEGETABLES', label: 'Vegetables', emoji: '🥬' },
  { value: 'DAIRY', label: 'Dairy', emoji: '🥛' },
  { value: 'MEAT', label: 'Meat', emoji: '🍖' },
  { value: 'BAKERY', label: 'Bakery', emoji: '🍞' },
  { value: 'FRUITS', label: 'Fruits', emoji: '🍎' },
  { value: 'FROZEN', label: 'Frozen', emoji: '❄️' },
  { value: 'DRINKS', label: 'Drinks', emoji: '🥤' },
  { value: 'CONDIMENTS', label: 'Condiments', emoji: '🧂' },
  { value: 'SWEETS', label: 'Sweets', emoji: '🍫' },
  { value: 'OTHER', label: 'Other', emoji: '📦' },
];

interface CategoryFilterProps {
  selectedCategory: ShoppingCategory | 'ALL';
  onCategoryChange: (category: ShoppingCategory | 'ALL') => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className={styles.container}>
      <div className={styles.filterScroll}>
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            className={`${styles.chip} ${
              selectedCategory === category.value ? styles.active : ''
            }`}
            onClick={() => onCategoryChange(category.value)}
            type="button"
            aria-pressed={selectedCategory === category.value}
          >
            <span className={styles.emoji}>{category.emoji}</span>
            <span className={styles.label}>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
