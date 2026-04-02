'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCategory } from '@prisma/client';
import type { ActionTab } from '../ActionTabBar/ActionTabBar';
import AddItemForm from '../AddItemForm/AddItemForm';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import ScannerPanel from '../ScannerPanel/ScannerPanel';
import styles from './ActionPanel.module.scss';

interface ActionPanelProps {
  activeTab: ActionTab | null;
  onAddItem: (
    name: string,
    productId?: string,
    product?: {
      emoji?: string | null;
      defaultUnit?: string | null;
      category?: ShoppingCategory;
    }
  ) => void;
  selectedCategory: ShoppingCategory | 'ALL';
  onCategoryChange: (category: ShoppingCategory | 'ALL') => void;
  availableCategories: ShoppingCategory[];
}

const MOTION_PANEL = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.25, ease: 'easeInOut' as const },
};

export default function ActionPanel({
  activeTab,
  onAddItem,
  selectedCategory,
  onCategoryChange,
  availableCategories,
}: ActionPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {activeTab && (
        <motion.div
          key={activeTab}
          className={styles.panel}
          {...MOTION_PANEL}
        >
          <div className={styles.panelContent}>
            {activeTab === 'search' && (
              <AddItemForm onAddItem={onAddItem} />
            )}

            {activeTab === 'scanner' && <ScannerPanel />}

            {activeTab === 'filter' && (
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                availableCategories={availableCategories}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
