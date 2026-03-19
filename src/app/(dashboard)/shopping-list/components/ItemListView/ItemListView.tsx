'use client';

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ShoppingCategory } from '@prisma/client';
import { useCallback, useMemo, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingItemWithCreator } from '@/types/shopping';
import { AlertModal } from '@/components/shared/Modal';
import { reorderShoppingItems } from '@/app/lib/shopping-actions';
import { useDndSensors } from '../../hooks/useDndSensors';
import CategoryHeader from '@/components/shared/CategoryHeader';
import { CATEGORIES } from '@/config/shopping';
import ShoppingItem from '../ShoppingItem/ShoppingItem';
import EmptyState from '../EmptyState/EmptyState';
import styles from './ItemListView.module.scss';

interface SourceListInfo {
  id: string;
  name: string;
  emoji: string | null;
}

type SourceListMap = Map<string, SourceListInfo>;

interface ItemListViewProps {
  items: ShoppingItemWithCreator[];
  listId: string;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateItem: (
    itemId: string,
    updates: Partial<ShoppingItemWithCreator>
  ) => Promise<void>;
  onToggleItem: (itemId: string, checked: boolean) => Promise<void>;
  onClearCheckedItems: (itemIds: string[]) => Promise<void>;
  enableReorder?: boolean;
  onReorderItems?: (listId: string, items: ShoppingItemWithCreator[]) => void;
  sourceListMap?: SourceListMap;
  emptyMessage?: string;
  selectedCategory?: ShoppingCategory | 'ALL';
}

const MOTION_ITEM = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

const MOTION_CHECKED = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

const MOTION_LIST = {
  layout: true as const,
  transition: { duration: 0.2 },
};

export default function ItemListView({
  items,
  listId,
  onDeleteItem,
  onUpdateItem,
  onToggleItem,
  onClearCheckedItems,
  enableReorder = false,
  onReorderItems,
  sourceListMap,
  emptyMessage = 'Brak produktów na liście',
  selectedCategory = 'ALL',
}: ItemListViewProps) {
  const sensors = useDndSensors({ touchDelay: 400 });
  const [isPending, startTransition] = useTransition();
  const [showClearWarning, setShowClearWarning] = useState(false);

  // Filter items based on category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'ALL') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const uncheckedItems = useMemo(
    () => filteredItems.filter((item) => !item.checked),
    [filteredItems]
  );
  const allUncheckedItems = useMemo(
    () => items.filter((item) => !item.checked),
    [items]
  );

  const checkedItems = useMemo(
    () => filteredItems.filter((item) => item.checked),
    [filteredItems]
  );
  const allCheckedItems = useMemo(
    () => items.filter((item) => item.checked),
    [items]
  );

  const checkedIds = useMemo(
    () => checkedItems.map((item) => item.id),
    [checkedItems]
  );

  const missingPriceCount = useMemo(
    () => checkedItems.filter((item) => item.price === null).length,
    [checkedItems]
  );

  const isEmpty = uncheckedItems.length === 0 && checkedItems.length === 0;

  const groupItemsByCategory = useCallback((inputItems: ShoppingItemWithCreator[]) => {
    const groups = new Map<ShoppingCategory, ShoppingItemWithCreator[]>();
    for (const item of inputItems) {
      const existing = groups.get(item.category) || [];
      existing.push(item);
      groups.set(item.category, existing);
    }
    const orderedGroups: [ShoppingCategory, ShoppingItemWithCreator[]][] = [];
    for (const cat of CATEGORIES) {
      if (cat.value === 'ALL') continue;
      const categoryItems = groups.get(cat.value as ShoppingCategory);
      if (categoryItems?.length) {
        orderedGroups.push([cat.value as ShoppingCategory, categoryItems]);
      }
    }
    return orderedGroups;
  }, []);

  const allGroupedItems = useMemo(
    () => groupItemsByCategory(allUncheckedItems),
    [allUncheckedItems, groupItemsByCategory]
  );

  const groupedItems = useMemo(() => {
    if (selectedCategory === 'ALL') return allGroupedItems;
    return allGroupedItems.filter(([category]) => category === selectedCategory);
  }, [allGroupedItems, selectedCategory]);

  const handleDragEnd = useCallback(
    (
      category: ShoppingCategory,
      categoryItems: ShoppingItemWithCreator[],
      event: DragEndEvent
    ) => {
      if (!onReorderItems) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = categoryItems.findIndex((item) => item.id === active.id);
      const newIndex = categoryItems.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedCategoryItems = arrayMove(categoryItems, oldIndex, newIndex);

      const reorderedUnchecked = allGroupedItems.flatMap(([groupCategory, groupItems]) =>
        groupCategory === category ? reorderedCategoryItems : groupItems
      );

      const newItems = [...reorderedUnchecked, ...allCheckedItems];
      onReorderItems(listId, newItems);

      const itemIds = reorderedUnchecked.map((item) => item.id);
      startTransition(async () => {
        const result = await reorderShoppingItems(listId, itemIds);
        if (!result.success) {
          console.error('Failed to reorder:', result.error);
        }
      });
    },
    [allCheckedItems, allGroupedItems, listId, onReorderItems]
  );

  const getCategoryMeta = (category: ShoppingCategory) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat ?? { emoji: '📦', label: 'Inne' };
  };

  const renderItem = (item: ShoppingItemWithCreator, sortable = false) => (
    <ShoppingItem
      item={item}
      onDelete={onDeleteItem}
      onUpdate={onUpdateItem}
      onToggle={onToggleItem}
      sourceList={sourceListMap?.get(item.id)}
      sortable={sortable}
    />
  );

  const renderUncheckedList = () => {
    if (uncheckedItems.length === 0) return null;

    const content = (
      <div className={styles.categoryGroups}>
        {groupedItems.map(([category, categoryItems]) => {
          const meta = getCategoryMeta(category);
          const categoryContent = (
            <div className={styles.list} role="list" aria-labelledby={`category-${category}`}>
              <AnimatePresence mode="popLayout">
                {categoryItems.map((item) => (
                  <motion.div key={item.id} layout layoutId={item.id} {...MOTION_ITEM}>
                    {renderItem(item, enableReorder)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          );

          return (
            <div key={category} className={styles.categoryGroup}>
              <CategoryHeader
                id={`category-${category}`}
                emoji={meta.emoji}
                label={meta.label}
                count={categoryItems.length}
              />

              {!enableReorder ? (
                categoryContent
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    void handleDragEnd(category, categoryItems, event);
                  }}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext
                    items={categoryItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categoryContent}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          );
        })}
      </div>
    );

    return content;
  };

  const handleClearCompleted = useCallback(() => {
    if (checkedIds.length === 0) return;

    if (missingPriceCount > 0) {
      setShowClearWarning(true);
      return;
    }

    startTransition(async () => {
      await onClearCheckedItems(checkedIds);
    });
  }, [checkedIds, missingPriceCount, onClearCheckedItems]);

  const runClearCompleted = useCallback(() => {
    if (checkedIds.length === 0) return;

    startTransition(async () => {
      await onClearCheckedItems(checkedIds);
      setShowClearWarning(false);
    });
  }, [checkedIds, onClearCheckedItems]);

  return (
    <>
      <div className={styles.listSection}>
        {isEmpty ? (
          <EmptyState
            title={selectedCategory === 'ALL' ? emptyMessage : 'Brak produktów w tej kategorii'}
            description={
              selectedCategory === 'ALL'
                ? 'Dodaj pierwszy produkt, aby zacząć kompletować zakupy.'
                : 'Wybierz inną kategorię albo dodaj produkt do tej sekcji.'
            }
          />
        ) : (
          <div className={styles.viewport}>
            {renderUncheckedList()}

            {checkedItems.length > 0 && (
              <div className={styles.completedSection}>
                <div className={styles.completedHeader}>
                  <h2 className={styles.completedTitle}>
                    Kupione ({checkedItems.length})
                  </h2>
                  <button
                    className={styles.clearButton}
                    onClick={handleClearCompleted}
                    disabled={isPending}
                    type="button"
                  >
                    {isPending ? 'Czyszczenie...' : 'Wyczyść'}
                  </button>
                </div>

                <motion.div className={styles.completedList} {...MOTION_LIST} role="list">
                  <AnimatePresence mode="popLayout">
                    {checkedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        layoutId={item.id}
                        {...MOTION_CHECKED}
                      >
                        {renderItem(item)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
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
