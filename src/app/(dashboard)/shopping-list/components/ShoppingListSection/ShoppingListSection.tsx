'use client';

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ShoppingCategory } from '@prisma/client';
import { useState, useMemo, useCallback, useTransition } from 'react';
import {
  ShoppingListWithItems,
  ShoppingItemWithCreator,
} from '@/types/shopping';
import {
  clearCheckedItems as clearCheckedItemsAction,
  reorderShoppingItems,
} from '@/app/lib/shopping-actions';
import { useDndSensors } from '../../hooks/useDndSensors';
import ShoppingItem from '../ShoppingItem/ShoppingItem';
import AddItemForm from '../AddItemForm/AddItemForm';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import ListHeader from '../ListHeader/ListHeader';
import styles from '../ShoppingList/ShoppingList.module.scss';

interface ShoppingListSectionProps {
  list: ShoppingListWithItems;
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
  onReorderItems: (listId: string, items: ShoppingItemWithCreator[]) => void;
  onClearCheckedItems: () => void;
  onDeleteList: (listId: string) => void;
  onDeleteAllItems: (listId: string) => void;
}

export default function ShoppingListSection({
  list,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  onToggleItem,
  onReorderItems,
  onClearCheckedItems,
  onDeleteList,
  onDeleteAllItems,
}: ShoppingListSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    ShoppingCategory | 'ALL'
  >('ALL');
  const [isPending, startTransition] = useTransition();
  const sensors = useDndSensors();

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'ALL') return list.items;
    return list.items.filter((item) => item.category === selectedCategory);
  }, [list.items, selectedCategory]);

  const { uncheckedItems, checkedItems } = useMemo(
    () => ({
      uncheckedItems: filteredItems.filter((item) => !item.checked),
      checkedItems: filteredItems.filter((item) => item.checked),
    }),
    [filteredItems]
  );

  const availableCategories = useMemo(
    () => Array.from(new Set(list.items.map((item) => item.category))),
    [list.items]
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
    ) => onAddItem(list.id, name, productId, product),
    [list.id, onAddItem]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
      onReorderItems(list.id, newItems);

      const itemIds = reorderedUnchecked.map((item) => item.id);
      startTransition(async () => {
        const result = await reorderShoppingItems(list.id, itemIds);
        if (!result.success) {
          console.error('Failed to reorder:', result.error);
        }
      });
    },
    [list.id, uncheckedItems, checkedItems, onReorderItems]
  );

  const handleClearCompleted = useCallback(() => {
    startTransition(async () => {
      await clearCheckedItemsAction();
      onClearCheckedItems();
    });
  }, [onClearCheckedItems]);

  const isEmpty = uncheckedItems.length === 0 && checkedItems.length === 0;

  return (
    <div className={styles.listSection}>
      <ListHeader
        list={list}
        itemCount={list.items.length}
        onDelete={onDeleteList}
        onDeleteAll={onDeleteAllItems}
        isLoading={isPending}
      />

      <AddItemForm onAddItem={handleAddItem} />

      {list.items.length > 0 && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          availableCategories={availableCategories}
        />
      )}

      {isEmpty ? (
        <div className={styles.emptyState}>
          <p>Brak produktów na liście</p>
          <p className={styles.emptyStateHint}>Dodaj pierwszy produkt</p>
        </div>
      ) : (
        <>
          {uncheckedItems.length > 0 && (
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
                <ul className={styles.list}>
                  {uncheckedItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onDelete={onDeleteItem}
                      onUpdate={onUpdateItem}
                      onToggle={onToggleItem}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
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
              <ul className={styles.completedList}>
                {checkedItems.map((item) => (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onDelete={onDeleteItem}
                    onUpdate={onUpdateItem}
                    onToggle={onToggleItem}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
