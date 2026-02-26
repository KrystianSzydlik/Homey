import { useOptimistic, useCallback } from 'react';
import { useToast } from '@/components/ToastContainer';
import {
  ShoppingListWithItems,
  ShoppingItemWithCreator,
  ShoppingListWithCreator,
} from '@/types/shopping';
import { useShoppingListState } from './useShoppingListState';
import {
  toggleShoppingItemChecked,
  deleteShoppingItem,
  createShoppingItem,
  clearCheckedItems as clearCheckedItemsAction,
  updateShoppingItem,
} from '@/app/lib/shopping-actions';

type OptimisticAction =
  | { type: 'ADD_LIST'; payload: ShoppingListWithCreator }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'REORDER_LISTS'; payload: ShoppingListWithItems[] }
  | { type: 'ADD_ITEM'; payload: ShoppingItemWithCreator }
  | { type: 'DELETE_ITEM'; payload: string }
  | {
      type: 'UPDATE_ITEM';
      payload: { itemId: string; updatedItem: ShoppingItemWithCreator };
    }
  | { type: 'TOGGLE_ITEM'; payload: { itemId: string; checked: boolean } }
  | {
      type: 'REORDER_ITEMS';
      payload: { listId: string; items: ShoppingItemWithCreator[] };
    }
  | { type: 'DELETE_ALL_ITEMS'; payload: string }
  | { type: 'CLEAR_CHECKED_ITEMS'; payload: { itemIds: string[] } };

function optimisticReducer(
  currentState: ShoppingListWithItems[],
  action: OptimisticAction
): ShoppingListWithItems[] {
  switch (action.type) {
    case 'ADD_LIST':
      return [...currentState, { ...action.payload, items: [] }];

    case 'DELETE_LIST':
      return currentState.filter((list) => list.id !== action.payload);

    case 'REORDER_LISTS':
      return action.payload;

    case 'ADD_ITEM':
      return currentState.map((list) =>
        list.id === action.payload.shoppingListId
          ? {
              ...list,
              items: [...list.items, action.payload],
              _count: { ...list._count, items: list._count.items + 1 },
            }
          : list
      );

    case 'DELETE_ITEM':
      return currentState.map((list) => {
        if (list.items.some((item) => item.id === action.payload)) {
          return {
            ...list,
            items: list.items.filter((item) => item.id !== action.payload),
            _count: { ...list._count, items: Math.max(0, list._count.items - 1) },
          };
        }
        return list;
      });

    case 'UPDATE_ITEM':
      return currentState.map((list) =>
        list.id === action.payload.updatedItem.shoppingListId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === action.payload.itemId
                  ? action.payload.updatedItem
                  : item
              ),
            }
          : list
      );

    case 'TOGGLE_ITEM':
      return currentState.map((list) => ({
        ...list,
        items: list.items.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, checked: action.payload.checked }
            : item
        ),
      }));

    case 'REORDER_ITEMS':
      return currentState.map((list) =>
        list.id === action.payload.listId
          ? { ...list, items: action.payload.items }
          : list
      );

    case 'DELETE_ALL_ITEMS':
      return currentState.map((list) =>
        list.id === action.payload
          ? { ...list, items: [], _count: { ...list._count, items: 0 } }
          : list
      );

    case 'CLEAR_CHECKED_ITEMS':
      return currentState.map((list) => {
        const remainingItems = list.items.filter(
          (item) => !action.payload.itemIds.includes(item.id)
        );
        return {
          ...list,
          items: remainingItems,
          _count: { ...list._count, items: remainingItems.length },
        };
      });

    default:
      return currentState;
  }
}

/**
 * Executes a server action with standardized error handling + toast notifications.
 * Eliminates the repeated try/catch/showToast pattern across optimistic handlers.
 */
async function executeWithToast<T extends { success: boolean; error?: string }>(
  action: () => Promise<T>,
  onSuccess: (result: T) => void,
  errorMessage: string,
  showToast: (msg: string, type: 'error') => void
): Promise<void> {
  try {
    const result = await action();
    if (result.success) {
      onSuccess(result);
    } else {
      showToast(result.error || errorMessage, 'error');
    }
  } catch {
    showToast(errorMessage, 'error');
  }
}

export function useOptimisticShoppingList(
  initialLists: ShoppingListWithItems[]
) {
  const baseState = useShoppingListState(initialLists);
  const { showToast } = useToast();

  const [optimisticLists, dispatchOptimistic] = useOptimistic<
    ShoppingListWithItems[],
    OptimisticAction
  >(baseState.lists, optimisticReducer);

  const addList = useCallback(
    (list: ShoppingListWithCreator) => {
      dispatchOptimistic({ type: 'ADD_LIST', payload: list });
      baseState.addList(list);
    },
    [dispatchOptimistic, baseState]
  );

  const addItemOptimistic = useCallback(
    async (item: ShoppingItemWithCreator) => {
      dispatchOptimistic({ type: 'ADD_ITEM', payload: item });

      await executeWithToast(
        () =>
          createShoppingItem({
            name: item.name,
            shoppingListId: item.shoppingListId,
            productId: item.productId || item.id,
            unit: item.unit || undefined,
            category: item.category,
            quantity: item.quantity,
            emoji: item.emoji || undefined,
          }),
        (result) => {
          if (result.item) baseState.addItem(result.item);
        },
        'Failed to add item',
        showToast
      );
    },
    [dispatchOptimistic, baseState, showToast]
  );

  const toggleItemOptimistic = useCallback(
    async (itemId: string, checked: boolean) => {
      dispatchOptimistic({ type: 'TOGGLE_ITEM', payload: { itemId, checked } });

      await executeWithToast(
        () => toggleShoppingItemChecked(itemId),
        (result) => {
          if (result.item)
            baseState.updateItem(itemId, result.item as ShoppingItemWithCreator);
        },
        'Failed to update item',
        showToast
      );
    },
    [dispatchOptimistic, baseState, showToast]
  );

  const deleteItemOptimistic = useCallback(
    async (itemId: string) => {
      dispatchOptimistic({ type: 'DELETE_ITEM', payload: itemId });

      await executeWithToast(
        () => deleteShoppingItem(itemId),
        () => baseState.deleteItem(itemId),
        'Failed to delete item',
        showToast
      );
    },
    [dispatchOptimistic, baseState, showToast]
  );

  const updateItemOptimistic = useCallback(
    async (itemId: string, updates: Partial<ShoppingItemWithCreator>) => {
      const currentList = optimisticLists.find((l) =>
        l.items.some((i) => i.id === itemId)
      );
      const currentItem = currentList?.items.find((i) => i.id === itemId);
      if (!currentItem) return;

      const updatedItem = { ...currentItem, ...updates };
      dispatchOptimistic({
        type: 'UPDATE_ITEM',
        payload: { itemId, updatedItem },
      });

      await executeWithToast(
        () =>
          updateShoppingItem(itemId, {
            name: updates.name,
            quantity: updates.quantity,
            unit: updates.unit || undefined,
            category: updates.category,
            emoji: updates.emoji || undefined,
            checked: updates.checked,
            productId: updates.productId,
          }),
        (result) => {
          if (result.item)
            baseState.updateItem(itemId, result.item as ShoppingItemWithCreator);
        },
        'Failed to update item',
        showToast
      );
    },
    [optimisticLists, dispatchOptimistic, baseState, showToast]
  );

  const reorderListsOptimistic = useCallback(
    (lists: ShoppingListWithItems[]) => {
      dispatchOptimistic({ type: 'REORDER_LISTS', payload: lists });
      baseState.reorderLists(lists);
    },
    [dispatchOptimistic, baseState]
  );

  const clearCheckedItems = useCallback(
    async (itemIds: string[]) => {
      if (itemIds.length === 0) return;

      dispatchOptimistic({ type: 'CLEAR_CHECKED_ITEMS', payload: { itemIds } });

      await executeWithToast(
        () => clearCheckedItemsAction({ itemIds }),
        () => baseState.clearCheckedItems(itemIds),
        'Failed to clear items',
        showToast
      );
    },
    [dispatchOptimistic, baseState, showToast]
  );

  return {
    ...baseState,
    lists: optimisticLists,
    addList,
    addItemOptimistic,
    toggleItemOptimistic,
    deleteItemOptimistic,
    updateItemOptimistic,
    reorderListsOptimistic,
    clearCheckedItems,
  };
}
