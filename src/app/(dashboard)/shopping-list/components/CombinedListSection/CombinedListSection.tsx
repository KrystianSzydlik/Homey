'use client';

import { ShoppingCategory } from '@prisma/client';
import { useState, useMemo, useCallback, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingItemWithCreator } from '@/types/shopping';
import { AlertModal } from '@/components/shared/Modal';
import { CombinedItem } from '../../hooks/useCombinedListItems';
import ShoppingItem from '../ShoppingItem/ShoppingItem';
import AddItemForm from '../AddItemForm/AddItemForm';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import styles from '../ShoppingList/ShoppingList.module.scss';

interface CombinedListSectionProps {
  items: CombinedItem[];
  availableCategories: ShoppingCategory[];
  defaultListId: string;
  onAddItem: (
    listId: string,
    name: string,
    productId?: string,
    product?: {
      emoji?: string | null;
      defaultUnit?: string | null;
      category?: ShoppingCategory;
    }
  ) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateItem: (
    itemId: string,
    updates: Partial<ShoppingItemWithCreator>
  ) => Promise<void>;
  onToggleItem: (itemId: string, checked: boolean) => Promise<void>;
  onClearCheckedItems: (itemIds: string[]) => Promise<void>;
}

export default function CombinedListSection({
  items,
  availableCategories,
  defaultListId,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  onToggleItem,
  onClearCheckedItems,
}: CombinedListSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    ShoppingCategory | 'ALL'
  >('ALL');
  const [showClearWarning, setShowClearWarning] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'ALL') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const { uncheckedItems, checkedItems } = useMemo(
    () => ({
      uncheckedItems: filteredItems.filter((item) => !item.checked),
      checkedItems: filteredItems.filter((item) => item.checked),
    }),
    [filteredItems]
  );

  const checkedIds = useMemo(
    () => checkedItems.map((item) => item.id),
    [checkedItems]
  );
  const missingPriceCount = useMemo(
    () => checkedItems.filter((item) => item.price === null).length,
    [checkedItems]
  );

  const handleAddItem = useCallback(
    (
      name: string,
      productId?: string,
      product?: {
        emoji?: string | null;
        defaultUnit?: string | null;
        category?: ShoppingCategory;
      }
    ) => onAddItem(defaultListId, name, productId, product),
    [defaultListId, onAddItem]
  );

  const runClearCompleted = useCallback(() => {
    if (checkedIds.length === 0) return;

    startTransition(async () => {
      await onClearCheckedItems(checkedIds);
      setShowClearWarning(false);
    });
  }, [checkedIds, onClearCheckedItems]);

  const handleClearCompleted = useCallback(() => {
    if (checkedIds.length === 0) return;

    if (missingPriceCount > 0) {
      setShowClearWarning(true);
      return;
    }

    runClearCompleted();
  }, [checkedIds, missingPriceCount, runClearCompleted]);

  const isEmpty = uncheckedItems.length === 0 && checkedItems.length === 0;

  return (
    <>
      <div className={styles.listSection}>
        <AddItemForm onAddItem={handleAddItem} />

        {items.length > 0 && (
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            availableCategories={availableCategories}
          />
        )}

        {isEmpty ? (
          <div className={styles.emptyState}>
            <p>Brak produktów na wybranych listach</p>
            <p className={styles.emptyStateHint}>Dodaj pierwszy produkt</p>
          </div>
        ) : (
          <div className={styles.uncheckedViewport}>
            {uncheckedItems.length > 0 && (
              <motion.ul
                className={styles.list}
                layout
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence mode="popLayout">
                  {uncheckedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      layoutId={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.2 },
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <ShoppingItem
                        item={item}
                        onDelete={onDeleteItem}
                        onUpdate={onUpdateItem}
                        onToggle={onToggleItem}
                        sourceList={item.sourceList}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}

            {checkedItems.length > 0 && (
              <div className={styles.completedSection}>
                <div className={styles.completedHeader}>
                  <h2 className={styles.completedTitle}>
                    Completed ({checkedItems.length})
                  </h2>
                  <button
                    className={styles.clearButton}
                    onClick={handleClearCompleted}
                    disabled={isPending}
                    type="button"
                  >
                    {isPending ? 'Clearing...' : 'Clear'}
                  </button>
                </div>

                <motion.ul
                  className={styles.completedList}
                  layout
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence mode="popLayout">
                    {checkedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        layoutId={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                          opacity: 0,
                          x: -20,
                          transition: { duration: 0.15 },
                        }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <ShoppingItem
                          item={item}
                          onDelete={onDeleteItem}
                          onUpdate={onUpdateItem}
                          onToggle={onToggleItem}
                          sourceList={item.sourceList}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </div>
            )}
          </div>
        )}
      </div>

      {showClearWarning && (
        <AlertModal
          isOpen={true}
          title="Brakujące ceny"
          message={`Masz ${missingPriceCount} kupionych produktów bez ceny. Wyczyścić mimo to?`}
          onConfirm={runClearCompleted}
          onCancel={() => setShowClearWarning(false)}
          confirmText="Wyczyść mimo braków"
          cancelText="Uzupełnij ceny"
          variant="warning"
          isLoading={isPending}
        />
      )}
    </>
  );
}
