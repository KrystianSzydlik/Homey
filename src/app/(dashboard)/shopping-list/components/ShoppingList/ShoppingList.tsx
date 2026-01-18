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
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ShoppingCategory } from '@prisma/client';
import {
  useCallback,
  useMemo,
  useState,
  useTransition,
  useEffect,
} from 'react';
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
import { useOptimisticShoppingList } from '@/app/(dashboard)/shopping-list/hooks/useOptimisticShoppingList'; // Use optimistic hook
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
    addList, // Note: This updates base state. Optimistic hook also exposes addListOptimistic if needed.
    addListOptimistic,
    deleteList,
    toggleListSelection,
    addItemOptimistic,
    deleteItemOptimistic,
    updateItemOptimistic,
    toggleItemOptimistic,
    reorderItems, // This is likely base state updater? We might want optimistic reorder too.
    deleteAllItems,
    clearCheckedItems,
  } = useOptimisticShoppingList(initialLists);

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
        delay: 0, // Set delay to 0 for immediate activation
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
    async (newList: ShoppingListWithCreator) => {
      // For lists, we might not rely heavily on optimistic updates since it's a modal action
      // But we can use it.
      // addList(newList); // Existing
      await addListOptimistic(newList);
      // The modal currently calls the server action internally?
      // No, CreateListModal likely calls a prop or internal action.
      // Let's assume CreateListModal returns the created list after server success.
      // If so, addList(newList) updates the base state.
      // If we want optimistic, we need to know BEFORE server return.
      // But preserving existing behavior for list creation is fine.
    },
    [addListOptimistic]
  );

  const handleAddItem = useCallback(
    async (
      listId: string,
      name: string,
      productId?: string,
      product?: { emoji?: string | null; defaultUnit?: string | null }
    ) => {
      // Construct a temporary item for optimistic update
      // Note: productId is required in Prisma but optional for optimistic items
      // The server action will handle proper product linking
      const newItem = {
        id: `temp-${Date.now()}`,
        name,
        quantity: '1',
        unit: product?.defaultUnit || null,
        category: 'OTHER',
        checked: false,
        position: 0,
        shoppingListId: listId,
        emoji: null,
        purchaseCount: 0,
        lastPurchasedAt: null,
        averageDaysBetweenPurchases: null,
        productId: productId ?? '',
        householdId: '',
        createdById: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: { name: 'You' },
        product: product ? { name, emoji: product.emoji ?? null } : null,
      } satisfies ShoppingItemWithCreator;

      await addItemOptimistic(newItem);
    },
    [addItemOptimistic]
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      await deleteItemOptimistic(itemId);
    },
    [deleteItemOptimistic]
  );

  const handleItemUpdate = useCallback(
    async (itemId: string, updatedItem: Partial<ShoppingItemWithCreator>) => {
      await updateItemOptimistic(itemId, updatedItem);
    },
    [updateItemOptimistic]
  );

  const handleToggleItem = useCallback(
    async (itemId: string, checked: boolean) => {
      await toggleItemOptimistic(itemId, checked);
    },
    [toggleItemOptimistic]
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
    // Ideally use optimistic clear
    // clearCheckedItems(); // Base state
    startTransition(async () => {
      await clearCheckedItemsAction();
      clearCheckedItems();
    });
  }, [clearCheckedItems]);

  const handleDeleteList = useCallback(
    (listId: string) => {
      startTransition(async () => {
        // Optimistic delete?
        // deleteListOptimistic(listId)
        const result = await deleteShoppingList(listId);
        if (result.success) {
          deleteList(listId);
          setDeleteListId(null);
        }
      });
    },
    [deleteList]
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
                  onAddItem={(name, productId, product) =>
                    handleAddItem(list.id, name, productId, product)
                  }
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
                                onDelete={handleDeleteItem}
                                onUpdate={handleItemUpdate}
                                onToggle={handleToggleItem}
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
                              onToggle={handleToggleItem}
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
