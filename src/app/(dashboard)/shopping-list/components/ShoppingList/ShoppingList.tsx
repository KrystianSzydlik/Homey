'use client';

import { ShoppingCategory } from '@prisma/client';
import { useCallback, useMemo, useEffect, useTransition } from 'react';
import { deleteAllShoppingItems } from '@/app/lib/shopping-actions';
import { deleteShoppingList } from '@/app/lib/shopping-list-actions';
import {
  ShoppingItemWithCreator,
  ShoppingListWithItems,
  ShoppingListWithCreator,
} from '@/types/shopping';
import { useOptimisticShoppingList } from '@/app/(dashboard)/shopping-list/hooks/useOptimisticShoppingList';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import { useShoppingListModals } from '../../hooks/useShoppingListModals';
import { createOptimisticItem } from '../../utils/createOptimisticItem';
import ShoppingListSection from '../ShoppingListSection/ShoppingListSection';
import ListSelector from '../ListSelector/ListSelector';
import CreateListModal from '../CreateListModal/CreateListModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import ListGrid from '../ListGrid/ListGrid';
import styles from './ShoppingList.module.scss';

interface ShoppingListProps {
  initialLists: ShoppingListWithItems[];
}

export default function ShoppingList({ initialLists }: ShoppingListProps) {
  const {
    lists,
    selectedListId,
    addList,
    deleteList,
    selectList,
    addItemOptimistic,
    deleteItemOptimistic,
    updateItemOptimistic,
    toggleItemOptimistic,
    reorderItems,
    deleteAllItems,
    clearCheckedItems,
  } = useOptimisticShoppingList(initialLists);

  const { refreshIfStale } = useProductCacheContext();
  const modals = useShoppingListModals();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    refreshIfStale();
  }, [refreshIfStale]);

  const selectedList = useMemo(
    () => lists.find((list) => list.id === selectedListId) ?? null,
    [lists, selectedListId]
  );

  const handleListCreated = useCallback(
    (newList: ShoppingListWithCreator) => {
      addList(newList);
    },
    [addList]
  );

  const handleAddItem = useCallback(
    async (
      listId: string,
      name: string,
      productId?: string,
      product?: {
        emoji?: string | null;
        defaultUnit?: string | null;
        category?: ShoppingCategory;
      }
    ) => {
      const newItem = createOptimisticItem({
        listId,
        name,
        productId,
        product,
      });
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
    async (itemId: string, updates: Partial<ShoppingItemWithCreator>) => {
      await updateItemOptimistic(itemId, updates);
    },
    [updateItemOptimistic]
  );

  const handleToggleItem = useCallback(
    async (itemId: string, checked: boolean) => {
      await toggleItemOptimistic(itemId, checked);
    },
    [toggleItemOptimistic]
  );

  const handleDeleteList = useCallback(
    (listId: string) => {
      startTransition(async () => {
        const result = await deleteShoppingList(listId);
        if (result.success) {
          deleteList(listId);
          modals.closeDeleteListModal();
        }
      });
    },
    [deleteList, modals]
  );

  const handleDeleteAllItems = useCallback(
    (listId: string) => {
      startTransition(async () => {
        const result = await deleteAllShoppingItems(listId);
        if (result.success) {
          deleteAllItems(listId);
          modals.closeDeleteAllModal();
        }
      });
    },
    [deleteAllItems, modals]
  );

  const renderContent = () => {
    if (lists.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>Utwórz swoją pierwszą listę zakupów</p>
          <button
            onClick={modals.openCreateModal}
            className={styles.createButton}
          >
            Utwórz listę
          </button>
        </div>
      );
    }

    if (!selectedListId) {
      return (
        <ListGrid
          lists={lists}
          onSelectList={selectList}
          onOpenCreateModal={modals.openCreateModal}
        />
      );
    }

    if (!selectedList) return null;

    return (
      <ShoppingListSection
        list={selectedList}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onUpdateItem={handleItemUpdate}
        onToggleItem={handleToggleItem}
        onReorderItems={reorderItems}
        onClearCheckedItems={clearCheckedItems}
        onDeleteList={modals.openDeleteListModal}
        onDeleteAllItems={modals.openDeleteAllModal}
      />
    );
  };

  return (
    <div className={styles.container}>
      {lists.length > 0 && selectedListId && (
        <ListSelector
          lists={lists}
          selectedListIds={[selectedListId]}
          onSelectList={selectList}
          onOpenCreateModal={modals.openCreateModal}
        />
      )}

      <CreateListModal
        isOpen={modals.isCreateModalOpen}
        onClose={modals.closeCreateModal}
        onListCreated={handleListCreated}
      />

      <div className={styles.content}>{renderContent()}</div>

      {modals.deleteListId && (
        <ConfirmModal
          isOpen={true}
          title="Delete Shopping List"
          message="Are you sure you want to delete this shopping list? All items will be permanently removed."
          onConfirm={() => handleDeleteList(modals.deleteListId!)}
          onCancel={modals.closeDeleteListModal}
          confirmText="Delete List"
          cancelText="Cancel"
          variant="danger"
          isLoading={isPending}
        />
      )}

      {modals.deleteAllListId && (
        <ConfirmModal
          isOpen={true}
          title="Clear All Items"
          message="Are you sure you want to delete all items from this list? This action cannot be undone."
          onConfirm={() => handleDeleteAllItems(modals.deleteAllListId!)}
          onCancel={modals.closeDeleteAllModal}
          confirmText="Delete All"
          cancelText="Cancel"
          variant="warning"
          isLoading={isPending}
        />
      )}
    </div>
  );
}
