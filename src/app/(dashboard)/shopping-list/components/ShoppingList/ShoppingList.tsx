'use client';

import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { ShoppingCategory } from '@prisma/client';
import { useCallback, useMemo, useState, useTransition, useEffect } from 'react';
import {
  clearCheckedItems as clearCheckedItemsAction,
  reorderShoppingItems,
  deleteAllShoppingItems,
} from '@/app/lib/shopping-actions';
import { deleteShoppingList } from '@/app/lib/shopping-list-actions';
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
import { useShoppingListState } from '@/app/(dashboard)/shopping-list/hooks/useShoppingListState';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import ListGrid from '../ListGrid/ListGrid';
import styles from './ShoppingList.module.scss';

interface ShoppingListProps {
  initialLists: ShoppingListWithItems[];
}

export default function ShoppingList({ initialLists }: ShoppingListProps) {
  const {
    lists,
    selectedListIds,
    addList,
    deleteList: removeList,
    toggleListSelection,
    addItem,
    deleteItem,
    updateItem,
    reorderItems,
    clearCheckedItems,
    deleteAllItems,
  } = useShoppingListState(initialLists);

  const { refreshIfStale } = useProductCacheContext();

  const [selectedCategory, setSelectedCategory] = useState<
    ShoppingCategory | 'ALL'
  >('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [deleteAllListId, setDeleteAllListId] = useState<string | null>(null);

  // Refresh product cache when shopping list loads (for multi-user sync)
  useEffect(() => {
    refreshIfStale();
  }, [refreshIfStale]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedLists = useMemo(
    () => lists.filter((list) => selectedListIds.includes(list.id)),
    [lists, selectedListIds]
  );

  const handleSelectList = useCallback(
    (listId: string) => {
      toggleListSelection(listId);
    },
    [toggleListSelection]
  );

  const handleListCreated = useCallback(
    (newList: ShoppingListWithCreator) => {
      addList(newList);
    },
    [addList]
  );

  const handleAddItem = useCallback(
    (newItem: ShoppingItemWithCreator) => {
      addItem(newItem);
    },
    [addItem]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      deleteItem(itemId);
    },
    [deleteItem]
  );

  const handleItemUpdate = useCallback(
    (itemId: string, updatedItem: ShoppingItemWithCreator) => {
      updateItem(itemId, updatedItem);
    },
    [updateItem]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent, listId: string) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const list = lists.find((l) => l.id === listId);
        if (!list) return;

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

          reorderItems(listId, newItems);

          const itemIds = reorderedUnchecked.map((item) => item.id);
          startTransition(async () => {
            const result = await reorderShoppingItems(listId, itemIds);
            if (!result.success) {
              console.error('Failed to reorder:', result.error);
            }
          });
        }
      }
    },
    [lists, reorderItems, startTransition]
  );

  const handleClearCompleted = useCallback(() => {
    startTransition(async () => {
      await clearCheckedItemsAction();
      clearCheckedItems();
    });
  }, [clearCheckedItems]);

  const handleDeleteList = useCallback(
    (listId: string) => {
      startTransition(async () => {
        const result = await deleteShoppingList(listId);
        if (result.success) {
          removeList(listId);
          setDeleteListId(null);
        }
      });
    },
    [removeList]
  );

  const handleDeleteAllItems = useCallback(
    (listId: string) => {
      startTransition(async () => {
        const result = await deleteAllShoppingItems(listId);
        if (result.success) {
          deleteAllItems(listId);
          setDeleteAllListId(null);
        }
      });
    },
    [deleteAllItems]
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Lista zakupów</h1>
      </header>

      {lists.length > 0 && selectedListIds.length > 0 && (
        <ListSelector
          lists={lists}
          selectedListIds={selectedListIds}
          onSelectList={handleSelectList}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      )}

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListCreated={handleListCreated}
      />

      <div className={styles.content}>
        {lists.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Utwórz swoją pierwszą listę zakupów</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={styles.createButton}
            >
              Utwórz listę
            </button>
          </div>
        ) : selectedListIds.length === 0 ? (
          <ListGrid
            lists={lists}
            onSelectList={handleSelectList}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        ) : (
          selectedLists.map((list) => {
            const filteredItems =
              selectedCategory === 'ALL'
                ? list.items
                : list.items.filter(
                    (item) => item.category === selectedCategory
                  );

            const uncheckedItems = filteredItems.filter(
              (item) => !item.checked
            );
            const checkedItems = filteredItems.filter((item) => item.checked);
            const isEmpty =
              uncheckedItems.length === 0 && checkedItems.length === 0;

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

                {list.items.length > 0 && (
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    availableCategories={Array.from(
                      new Set(list.items.map((item) => item.category))
                    )}
                  />
                )}

                {isEmpty ? (
                  <div className={styles.emptyState}>
                    <p>Brak produktów na liście</p>
                    <p className={styles.emptyStateHint}>
                      Dodaj pierwszy produkt
                    </p>
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
                                onUpdate={handleItemUpdate}
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
                              onUpdate={handleItemUpdate}
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
