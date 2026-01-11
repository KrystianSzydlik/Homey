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
import {
  clearCheckedItems,
  reorderShoppingItems,
  deleteAllShoppingItems,
} from '@/app/lib/shopping-actions';
import {
  deleteShoppingList,
} from '@/app/lib/shopping-list-actions';
import {
  ShoppingItemWithCreator,
  ShoppingListWithItems,
  ShoppingListWithCreator,
} from '@/types/shopping';
import ShoppingItem from '../ShoppingItem/ShoppingItem';
import AddItemForm from '../AddItemForm/AddItemForm';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import ListSelector from '../ListSelector/ListSelector';
import CreateListModal from '../CreateListModal/CreateListModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import ListHeader from '../ListHeader/ListHeader';
import styles from './ShoppingList.module.scss';

interface ShoppingListProps {
  initialLists: ShoppingListWithItems[];
}

export default function ShoppingList({ initialLists }: ShoppingListProps) {
  const [lists, setLists] = useState(initialLists);
  const [selectedListIds, setSelectedListIds] = useState<string[]>(
    lists.length > 0 ? [lists[0].id] : []
  );
  const [selectedCategory, setSelectedCategory] = useState<
    ShoppingCategory | 'ALL'
  >('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [deleteAllListId, setDeleteAllListId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const selectedLists = useMemo(
    () => lists.filter((list) => selectedListIds.includes(list.id)),
    [lists, selectedListIds]
  );

  const handleSelectList = useCallback((listId: string) => {
    setSelectedListIds((prev) => {
      if (prev.includes(listId)) {
        return prev.filter((id) => id !== listId);
      } else {
        return [...prev, listId];
      }
    });
  }, []);

  const handleListCreated = useCallback((newList: ShoppingListWithCreator) => {
    setLists((prev) => [...prev, { ...newList, items: [] }]);
    setSelectedListIds([newList.id]);
  }, []);

  const handleAddItem = useCallback(
    (newItem: ShoppingItemWithCreator) => {
      setLists((prev) =>
        prev.map((list) =>
          list.id === newItem.shoppingListId
            ? { ...list, items: [...list.items, newItem] }
            : list
        )
      );
    },
    []
  );

  const handleDeleteItem = useCallback((itemId: string) => {
    setLists((prev) =>
      prev.map((list) => ({
        ...list,
        items: list.items.filter((item) => item.id !== itemId),
      }))
    );
  }, []);

  const handleToggleItem = useCallback(
    (itemId: string, updatedItem: ShoppingItemWithCreator) => {
      setLists((prev) =>
        prev.map((list) =>
          list.id === updatedItem.shoppingListId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId ? updatedItem : item
                ),
              }
            : list
        )
      );
    },
    []
  );

  const handleUpdateItem = useCallback(
    (itemId: string, updatedItem: ShoppingItemWithCreator) => {
      setLists((prev) =>
        prev.map((list) =>
          list.id === updatedItem.shoppingListId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId ? updatedItem : item
                ),
              }
            : list
        )
      );
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent, listId: string) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setLists((currentLists) =>
          currentLists.map((list) => {
            if (list.id !== listId) return list;

            const currentItems = list.items;
            const uncheckedItems = currentItems.filter((item) => !item.checked);
            const checkedItems = currentItems.filter((item) => item.checked);

            const oldIndex = uncheckedItems.findIndex(
              (item) => item.id === active.id
            );
            const newIndex = uncheckedItems.findIndex(
              (item) => item.id === over.id
            );

            if (oldIndex !== -1 && newIndex !== -1) {
              const reorderedUnchecked = [...uncheckedItems];
              const [movedItem] = reorderedUnchecked.splice(oldIndex, 1);
              reorderedUnchecked.splice(newIndex, 0, movedItem);

              const newItems = [...reorderedUnchecked, ...checkedItems];

              // Persist to database
              const itemIds = reorderedUnchecked.map((item) => item.id);
              startTransition(async () => {
                const result = await reorderShoppingItems(listId, itemIds);
                if (!result.success) {
                  console.error('Failed to reorder:', result.error);
                }
              });

              return { ...list, items: newItems };
            }
            return list;
          })
        );
      }
    },
    [startTransition]
  );

  const handleClearCompleted = useCallback(() => {
    startTransition(async () => {
      await clearCheckedItems();
      setLists((prev) =>
        prev.map((list) => ({
          ...list,
          items: list.items.filter((item) => !item.checked),
        }))
      );
    });
  }, []);

  const handleDeleteList = useCallback((listId: string) => {
    startTransition(async () => {
      const result = await deleteShoppingList(listId);
      if (result.success) {
        setLists((prev) => prev.filter((list) => list.id !== listId));
        setSelectedListIds((prev) => prev.filter((id) => id !== listId));
        setDeleteListId(null);
      }
    });
  }, []);

  const handleDeleteAllItems = useCallback((listId: string) => {
    startTransition(async () => {
      const result = await deleteAllShoppingItems(listId);
      if (result.success) {
        setLists((prev) =>
          prev.map((list) =>
            list.id === listId ? { ...list, items: [] } : list
          )
        );
        setDeleteAllListId(null);
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Lista zakupów</h1>
      </header>

      <ListSelector
        lists={lists}
        selectedListIds={selectedListIds}
        onSelectList={handleSelectList}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListCreated={handleListCreated}
      />

      <div className={styles.content}>
        {selectedLists.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Wybierz listę lub utwórz nową</p>
          </div>
        ) : (
          selectedLists.map((list) => {
          const filteredItems = selectedCategory === 'ALL'
            ? list.items
            : list.items.filter((item) => item.category === selectedCategory);

          const uncheckedItems = filteredItems.filter((item) => !item.checked);
          const checkedItems = filteredItems.filter((item) => item.checked);
          const isEmpty = uncheckedItems.length === 0 && checkedItems.length === 0;

          return (
            <div key={list.id} className={styles.listSection}>
              <ListHeader
                list={list}
                itemCount={list.items.length}
                onDelete={setDeleteListId}
                onDeleteAll={setDeleteAllListId}
                isLoading={isPending}
              />

              <AddItemForm
                shoppingListId={list.id}
                onAddItem={handleAddItem}
              />

              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />

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
                      onDragEnd={(event) => handleDragEnd(event, list.id)}
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
          })
        )}
      </div>

      {/* Delete List Confirmation Modal */}
      {deleteListId && (
        <ConfirmModal
          isOpen={true}
          title="Delete Shopping List"
          message="Are you sure you want to delete this shopping list? All items will be permanently removed."
          onConfirm={() => handleDeleteList(deleteListId)}
          onCancel={() => setDeleteListId(null)}
          confirmText="Delete List"
          cancelText="Cancel"
          variant="danger"
          isLoading={isPending}
        />
      )}

      {/* Delete All Items Confirmation Modal */}
      {deleteAllListId && (
        <ConfirmModal
          isOpen={true}
          title="Clear All Items"
          message="Are you sure you want to delete all items from this list? This action cannot be undone."
          onConfirm={() => handleDeleteAllItems(deleteAllListId)}
          onCancel={() => setDeleteAllListId(null)}
          confirmText="Delete All"
          cancelText="Cancel"
          variant="warning"
          isLoading={isPending}
        />
      )}
    </div>
  );
}
