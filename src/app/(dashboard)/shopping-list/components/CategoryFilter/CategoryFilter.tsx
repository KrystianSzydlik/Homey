'use client';

import { ShoppingCategory } from '@prisma/client';
import { CATEGORIES } from '@/config/shopping';
import styles from './CategoryFilter.module.scss';

interface CategoryFilterProps {
  selectedCategory: ShoppingCategory | 'ALL';
  onCategoryChange: (category: ShoppingCategory | 'ALL') => void;
  availableCategories?: ShoppingCategory[];
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  availableCategories,
}: CategoryFilterProps) {
  const filteredCategories = availableCategories
    ? CATEGORIES.filter(
        (cat) =>
          cat.value === 'ALL' ||
          availableCategories.includes(cat.value as ShoppingCategory)
      )
    : CATEGORIES;

  // Only show the filter if there are categories to show (excluding 'ALL')
  if (availableCategories && availableCategories.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterScroll}>
        {filteredCategories.map((category) => (
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
