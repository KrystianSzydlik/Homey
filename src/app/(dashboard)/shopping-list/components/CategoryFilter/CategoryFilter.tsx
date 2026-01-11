'use client';

import { ShoppingCategory } from '@prisma/client';
import { CATEGORIES } from '@/config/shopping';
import styles from './CategoryFilter.module.scss';

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
