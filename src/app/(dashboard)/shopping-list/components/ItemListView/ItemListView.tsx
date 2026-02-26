'use client';

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ShoppingCategory } from '@prisma/client';
import { useCallback, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingItemWithCreator } from '@/types/shopping';
import { AlertModal } from '@/components/shared/Modal';
import { reorderShoppingItems } from '@/app/lib/shopping-actions';
import { useDndSensors } from '../../hooks/useDndSensors';
import { useItemListState } from '../../hooks/useItemListState';
import ShoppingItem from '../ShoppingItem/ShoppingItem';
import AddItemForm from '../AddItemForm/AddItemForm';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import styles from '../ShoppingList/ShoppingList.module.scss';

interface SourceListInfo {
  id: string;
  name: string;
  emoji: string | null;
}

/** Map from item ID to its source list info (only in combined/multi-list view) */
type SourceListMap = Map<string, SourceListInfo>;

interface ItemListViewProps {
  items: ShoppingItemWithCreator[];
  availableCategories: ShoppingCategory[];
  listId: string;
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
  /** Enable drag-and-drop reordering (single list mode only) */
  enableReorder?: boolean;
  onReorderItems?: (listId: string, items: ShoppingItemWithCreator[]) => void;
  /** Source list info per item (combined/multi-list view) */
  sourceListMap?: SourceListMap;
  /** Empty state message */
  emptyMessage?: string;
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
  availableCategories,
  listId,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  onToggleItem,
  onClearCheckedItems,
  enableReorder = false,
  onReorderItems,
  sourceListMap,
  emptyMessage = 'Brak produktów na liście',
}: ItemListViewProps) {
  const sensors = useDndSensors();
  const [, startTransition] = useTransition();

  const {
    selectedCategory,
    setSelectedCategory,
    uncheckedItems,
    checkedItems,
    isEmpty,
    isPending,
    showClearWarning,
    missingPriceCount,
    handleClearCompleted,
    runClearCompleted,
    closeClearWarning,
  } = useItemListState({
    items,
    availableCategories,
    onClearCheckedItems,
  });

  const handleAddItem = useCallback(
    (
      name: string,
      productId?: string,
      product?: {
        emoji?: string | null;
        defaultUnit?: string | null;
        category?: ShoppingCategory;
      }
    ) => onAddItem(listId, name, productId, product),
    [listId, onAddItem]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!onReorderItems) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = uncheckedItems.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = uncheckedItems.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedUnchecked = [...uncheckedItems];
      const [movedItem] = reorderedUnchecked.splice(oldIndex, 1);
      reorderedUnchecked.splice(newIndex, 0, movedItem);

      const newItems = [...reorderedUnchecked, ...checkedItems];
      onReorderItems(listId, newItems);

      const itemIds = reorderedUnchecked.map((item) => item.id);
      startTransition(async () => {
        const result = await reorderShoppingItems(listId, itemIds);
        if (!result.success) {
          console.error('Failed to reorder:', result.error);
        }
      });
    },
    [listId, uncheckedItems, checkedItems, onReorderItems]
  );

  const renderItem = (item: ShoppingItemWithCreator) => (
    <ShoppingItem
      item={item}
      onDelete={onDeleteItem}
      onUpdate={onUpdateItem}
      onToggle={onToggleItem}
      sourceList={sourceListMap?.get(item.id)}
    />
  );

  const renderUncheckedList = () => {
    if (uncheckedItems.length === 0) return null;

    const listContent = (
      <motion.ul className={styles.list} {...MOTION_LIST}>
        <AnimatePresence mode="popLayout">
          {uncheckedItems.map((item) => (
            <motion.div key={item.id} layout layoutId={item.id} {...MOTION_ITEM}>
              {renderItem(item)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.ul>
    );

    if (!enableReorder) return listContent;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={uncheckedItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {listContent}
        </SortableContext>
      </DndContext>
    );
  };

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
            <p>{emptyMessage}</p>
            <p className={styles.emptyStateHint}>Dodaj pierwszy produkt</p>
          </div>
        ) : (
          <div className={styles.uncheckedViewport}>
            {renderUncheckedList()}

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

                <motion.ul className={styles.completedList} {...MOTION_LIST}>
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
          onCancel={closeClearWarning}
          confirmText="Wyczyść mimo braków"
          cancelText="Uzupełnij ceny"
          variant="warning"
          isLoading={isPending}
        />
      )}
    </>
  );
}
