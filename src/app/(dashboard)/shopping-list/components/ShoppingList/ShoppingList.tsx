'use client';

import { ShoppingCategory } from '@prisma/client';
import { useCallback, useMemo, useEffect, useState, useTransition } from 'react';
import { deleteAllShoppingItems } from '@/app/lib/shopping-actions';
import { deleteShoppingList } from '@/app/lib/shopping-list-actions';
import {
  ShoppingItemWithCreator,
  ShoppingListWithCreator,
  ShoppingListWithItems,
} from '@/types/shopping';
import { useOptimisticShoppingList } from '@/app/(dashboard)/shopping-list/hooks/useOptimisticShoppingList';
import { useCombinedListItems } from '../../hooks/useCombinedListItems';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import { useShoppingListModals } from '../../hooks/useShoppingListModals';
import { createOptimisticItem } from '../../utils/createOptimisticItem';
import ItemListView from '../ItemListView/ItemListView';
import ListSelector from '../ListSelector/ListSelector';
import ListBottomSheet from '../ListBottomSheet/ListBottomSheet';
import { AlertModal } from '@/components/shared/Modal';
import ListGrid from '../ListGrid/ListGrid';
import ActionTabBar, { type ActionTab } from '../ActionTabBar/ActionTabBar';
import ActionPanel from '../ActionPanel/ActionPanel';
import SummaryBar from '../SummaryBar/SummaryBar';
import EmptyState from '../EmptyState/EmptyState';
import styles from './ShoppingList.module.scss';

interface ShoppingListProps {
  initialLists: ShoppingListWithItems[];
}

export default function ShoppingList({ initialLists }: ShoppingListProps) {
  const {
    lists,
    selectedListIds,
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
    reorderListsOptimistic,
  } = useOptimisticShoppingList(initialLists);

  const { refreshIfStale } = useProductCacheContext();
  const modals = useShoppingListModals();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<ActionTab | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory | 'ALL'>('ALL');

  useEffect(() => {
    refreshIfStale();
  }, [refreshIfStale]);

  // Combined items from all selected lists
  const { items: combinedItems, availableCategories: combinedAvailableCategories } = useCombinedListItems(
    lists,
    selectedListIds
  );

  // Single list when only one is selected
  const selectedList = useMemo(
    () =>
      selectedListIds.length === 1
        ? (lists.find((list) => list.id === selectedListIds[0]) ?? null)
        : null,
    [lists, selectedListIds]
  );

  // Default list for adding items (first selected)
  const defaultListId = selectedListIds[0] ?? '';
  const hasListSelected = selectedListIds.length > 0;

  // Source list map for combined view (item ID → source list info)
  const sourceListMap = useMemo(() => {
    if (selectedListIds.length <= 1) return undefined;
    const map = new Map<string, { id: string; name: string; emoji: string | null }>();
    for (const item of combinedItems) {
      map.set(item.id, item.sourceList);
    }
    return map;
  }, [selectedListIds.length, combinedItems]);

  const activeItems = useMemo(
    () => selectedList?.items ?? combinedItems,
    [selectedList, combinedItems]
  );

  const filterCategories = useMemo(
    () => Array.from(new Set(activeItems.map((item) => item.category))),
    [activeItems]
  );
  const resolvedSelectedCategory = useMemo(
    () =>
      selectedCategory === 'ALL' || filterCategories.includes(selectedCategory)
        ? selectedCategory
        : 'ALL',
    [filterCategories, selectedCategory]
  );

  // Summary counts for progress bar
  const summaryItems = useMemo(() => {
    return {
      total: activeItems.length,
      checked: activeItems.filter((item) => item.checked).length,
    };
  }, [activeItems]);

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
      startTransition(async () => {
        await addItemOptimistic(newItem);
      });
    },
    [addItemOptimistic]
  );

  // Shorthand for ActionPanel — adds to the default list
  const handleAddItemShorthand = useCallback(
    (
      name: string,
      productId?: string,
      product?: {
        emoji?: string | null;
        defaultUnit?: string | null;
        category?: ShoppingCategory;
      }
    ) => {
      if (!defaultListId) return;
      handleAddItem(defaultListId, name, productId, product);
    },
    [defaultListId, handleAddItem]
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      startTransition(async () => {
        await deleteItemOptimistic(itemId);
      });
    },
    [deleteItemOptimistic]
  );

  const handleItemUpdate = useCallback(
    async (itemId: string, updates: Partial<ShoppingItemWithCreator>) => {
      startTransition(async () => {
        await updateItemOptimistic(itemId, updates);
      });
    },
    [updateItemOptimistic]
  );

  const handleToggleItem = useCallback(
    async (itemId: string, checked: boolean) => {
      startTransition(async () => {
        await toggleItemOptimistic(itemId, checked);
      });
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
        <EmptyState
          title="Utwórz swoją pierwszą listę zakupów"
          description="Dodaj listę, aby szybko planować wspólne zakupy."
          actionLabel="Utwórz listę"
          onAction={modals.openCreateModal}
        />
      );
    }

    if (!hasListSelected) {
      return (
        <ListGrid
          lists={lists}
          onSelectList={selectList}
          onOpenCreateModal={modals.openCreateModal}
          onDeleteList={modals.openDeleteListModal}
          onDeleteAllItems={modals.openDeleteAllModal}
          onReorderLists={reorderListsOptimistic}
        />
      );
    }

    // Single list selected — use standard section with reordering
    if (selectedList) {
      return (
        <ItemListView
          items={selectedList.items}
          listId={selectedList.id}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleItemUpdate}
          onToggleItem={handleToggleItem}
          onClearCheckedItems={clearCheckedItems}
          enableReorder
          onReorderItems={reorderItems}
          selectedCategory={resolvedSelectedCategory}
        />
      );
    }

    // Multiple lists selected — use combined view
    return (
      <ItemListView
        items={combinedItems}
        listId={defaultListId}
        onDeleteItem={handleDeleteItem}
        onUpdateItem={handleItemUpdate}
        onToggleItem={handleToggleItem}
        onClearCheckedItems={clearCheckedItems}
        sourceListMap={sourceListMap}
        emptyMessage="Brak produktów na wybranych listach"
        selectedCategory={resolvedSelectedCategory}
      />
    );
  };

  return (
    <div className={styles.container}>
      {/* List Pill Selector */}
      {hasListSelected && lists.length > 0 && (
        <ListSelector
          lists={lists}
          selectedListIds={selectedListIds}
          onSelectList={selectList}
          onDeleteList={modals.openDeleteListModal}
          onDeleteAllItems={modals.openDeleteAllModal}
          onReorderLists={reorderListsOptimistic}
          onOpenCreateModal={modals.openCreateModal}
        />
      )}

      {/* Action Tab Bar + Expandable Panel */}
      {hasListSelected && (
        <>
          <ActionTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          <ActionPanel
            activeTab={activeTab}
            onAddItem={handleAddItemShorthand}
            selectedCategory={resolvedSelectedCategory}
            onCategoryChange={setSelectedCategory}
            availableCategories={
            selectedList
                ? filterCategories
                : combinedAvailableCategories
            }
          />
        </>
      )}

      {/* Summary Progress Bar */}
      {hasListSelected && (
        <SummaryBar
          totalItems={summaryItems.total}
          checkedItems={summaryItems.checked}
        />
      )}

      {/* Item List / Grid / Empty State */}
      <div className={styles.content}>{renderContent()}</div>

      {/* Modals */}
      <ListBottomSheet
        isOpen={modals.isCreateModalOpen}
        onClose={modals.closeCreateModal}
        onListCreated={handleListCreated}
      />

      {modals.deleteListId && (
        <AlertModal
          isOpen={true}
          title="Usuń listę zakupów"
          message="Czy na pewno chcesz usunąć tę listę? Wszystkie produkty z tej listy zostaną trwale skasowane."
          onConfirm={() => handleDeleteList(modals.deleteListId!)}
          onCancel={modals.closeDeleteListModal}
          confirmText="Usuń listę"
          cancelText="Anuluj"
          variant="danger"
          isLoading={isPending}
        />
      )}

      {modals.deleteAllListId && (
        <AlertModal
          isOpen={true}
          title="Wyczyść listę"
          message="Czy na pewno chcesz usunąć wszystkie produkty z tej listy? Tej operacji nie da się cofnąć."
          onConfirm={() => handleDeleteAllItems(modals.deleteAllListId!)}
          onCancel={modals.closeDeleteAllModal}
          confirmText="Usuń wszystko"
          cancelText="Anuluj"
          variant="warning"
          isLoading={isPending}
        />
      )}
    </div>
  );
}
