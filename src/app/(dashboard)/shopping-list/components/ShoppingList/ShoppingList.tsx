'use client';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ShoppingCategory } from '@prisma/client';
import { useCallback, useMemo, useState, useTransition } from 'react';
import { clearCheckedItems, reorderShoppingItems } from '@/app/lib/shopping-actions';
import { ShoppingItemWithCreator } from '@/types/shopping';
import ShoppingItem from '../ShoppingItem/ShoppingItem';
import AddItemForm from '../AddItemForm/AddItemForm';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import styles from './ShoppingList.module.scss';

interface ShoppingListProps {
  initialItems: ShoppingItemWithCreator[];
}

export default function ShoppingList({ initialItems }: ShoppingListProps) {
  const [items, setItems] = useState(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory | 'ALL'>('ALL');
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return items;
    }
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const handleAddItem = useCallback((newItem: ShoppingItemWithCreator) => {
    setItems((prev) => [...prev, newItem]);
  }, []);

  const handleDeleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleToggleItem = useCallback(
    (itemId: string, updatedItem: ShoppingItemWithCreator) => {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item)),
      );
    },
    [],
  );

  const handleUpdateItem = useCallback(
    (itemId: string, updatedItem: ShoppingItemWithCreator) => {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item)),
      );
    },
    [],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setItems((currentItems) => {
          // Reorder unchecked items only (checked items stay in separate section)
          const uncheckedItems = currentItems.filter((item) => !item.checked);
          const checkedItems = currentItems.filter((item) => item.checked);

          const oldIndex = uncheckedItems.findIndex((item) => item.id === active.id);
          const newIndex = uncheckedItems.findIndex((item) => item.id === over.id);

          if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedUnchecked = [...uncheckedItems];
            const [movedItem] = reorderedUnchecked.splice(oldIndex, 1);
            reorderedUnchecked.splice(newIndex, 0, movedItem);

            const newItems = [...reorderedUnchecked, ...checkedItems];

            // Persist to database
            const itemIds = reorderedUnchecked.map((item) => item.id);
            startTransition(async () => {
              const result = await reorderShoppingItems(itemIds);
              if (!result.success) {
                // Rollback will be handled by re-fetching or manual rollback
                console.error('Failed to reorder:', result.error);
              }
            });

            return newItems;
          }
          return currentItems;
        });
      }
    },
    [],
  );

  const handleClearCompleted = useCallback(() => {
    startTransition(async () => {
      await clearCheckedItems();
      setItems((prev) => prev.filter((item) => !item.checked));
    });
  }, []);

  const uncheckedItems = filteredItems.filter((item) => !item.checked);
  const checkedItems = filteredItems.filter((item) => item.checked);

  const isEmpty = uncheckedItems.length === 0 && checkedItems.length === 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Shopping List</h1>
      </header>

      <AddItemForm onAddItem={handleAddItem} />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {isEmpty ? (
        <div className={styles.emptyState}>
          <p>No items in your list</p>
          <p className={styles.emptyStateHint}>Add one to get started!</p>
        </div>
      ) : (
        <>
          {uncheckedItems.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
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
                      onDelete={handleDeleteItem}
                      onToggle={handleToggleItem}
                      onUpdate={handleUpdateItem}
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
                    onDelete={handleDeleteItem}
                    onToggle={handleToggleItem}
                    onUpdate={handleUpdateItem}
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
