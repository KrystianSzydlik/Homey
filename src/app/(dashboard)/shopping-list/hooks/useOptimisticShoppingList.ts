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
  addShoppingItem,
  updateShoppingItem,
} from '@/app/lib/shopping-actions';

type OptimisticAction =
  | { type: 'ADD_LIST'; payload: ShoppingListWithCreator }
  | { type: 'DELETE_LIST'; payload: string }
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
  | { type: 'CLEAR_CHECKED_ITEMS'; payload: { listId: string } }; // Added listId for clarity, though action might be global or list-specific

export function useOptimisticShoppingList(
  initialLists: ShoppingListWithItems[]
) {
  // We use useShoppingListState as the "server state" manager (source of truth that gets updated eventually)
  const baseState = useShoppingListState(initialLists);
  const { showToast } = useToast();

  const [optimisticLists, dispatchOptimistic] = useOptimistic<
    ShoppingListWithItems[],
    OptimisticAction
  >(baseState.lists, (currentState, action) => {
    switch (action.type) {
      case 'ADD_LIST':
        return [...currentState, { ...action.payload, items: [] }];

      case 'DELETE_LIST':
        return currentState.filter((list) => list.id !== action.payload);

      case 'ADD_ITEM':
        return currentState.map((list) =>
          list.id === action.payload.shoppingListId
            ? {
                ...list,
                items: [...list.items, action.payload],
                _count: {
                  ...list._count,
                  items: list._count.items + 1,
                },
              }
            : list
        );

      case 'DELETE_ITEM':
        return currentState.map((list) => {
          if (list.items.some((item) => item.id === action.payload)) {
            return {
              ...list,
              items: list.items.filter((item) => item.id !== action.payload),
              _count: {
                ...list._count,
                items: Math.max(0, list._count.items - 1),
              },
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
            ? {
                ...list,
                items: [],
                _count: { ...list._count, items: 0 },
              }
            : list
        );

      case 'CLEAR_CHECKED_ITEMS':
        return currentState.map((list) => {
          if (list.id === action.payload.listId) {
            const uncheckedItems = list.items.filter((item) => !item.checked);
            return {
              ...list,
              items: uncheckedItems,
              _count: {
                ...list._count,
                items: uncheckedItems.length,
              },
            };
          }
          return list;
        });

      default:
        return currentState;
    }
  });

  const addListOptimistic = useCallback(
    async (list: ShoppingListWithCreator) => {
      dispatchOptimistic({ type: 'ADD_LIST', payload: list });
      // Optimistic update done, now trigger side effect
      // Note: In a real app we might need to handle the ID generation for optimistic lists differently
      // Since createShoppingList returns the real list, we rely on parent to update the 'baseState'
      // But we can trigger the action here.
      // However, current ShoppingList implementation passes a handler to the modal.
      // We will adopt the pattern: Call optimistic -> Call API -> Call baseState updater (on success)

      // Since createShoppingList is called from the modal, we might just want to expose a wrapper
      // But looking at ShoppingList.tsx, it handles list creation separately.
      // We'll reimplement it here to encapsulate.
    },
    [dispatchOptimistic]
  );

  // Wrapper for addItem
  const addItemOptimistic = useCallback(
    async (item: ShoppingItemWithCreator) => {
      dispatchOptimistic({ type: 'ADD_ITEM', payload: item });
      // We assume the caller handles the API call and baseState update, OR we do it here?
      // For consistency with typical useOptimistic patterns, we often wrap the async action.
      // But to match the existing hook signature which exposes 'addItem' that updates baseState..
      // We should probably just expose the dispatchers or wrapped functions.

      // Let's implement full wrappers like the previous hook attempted, but correctly.
      try {
        const result = await addShoppingItem({
          name: item.name,
          shoppingListId: item.shoppingListId,
          productId: item.productId || item.id, // Fallback if it's a temp ID, though ideally we have real product ID
          unit: item.unit || undefined,
          category: item.category,
          quantity: item.quantity,
          emoji: item.emoji || undefined,
        });

        if (result.success && result.item) {
          baseState.addItem(result.item);
        } else {
          showToast(result.error || 'Failed to add item', 'error');
          // Optimistic state reverts automatically when baseState doesn't change?
          // weak point of useOptimistic if we don't revalidate.
          // React's useOptimistic reverts if the transition finishes.
          // But here we are manually managing baseState.
        }
      } catch {
        showToast('Failed to add item', 'error');
      }
    },
    [dispatchOptimistic, baseState, showToast]
  );

  const toggleItemOptimistic = useCallback(
    async (itemId: string, checked: boolean) => {
      dispatchOptimistic({ type: 'TOGGLE_ITEM', payload: { itemId, checked } });
      try {
        const result = await toggleShoppingItemChecked(itemId);
        if (result.success && result.item) {
          baseState.updateItem(itemId, result.item as ShoppingItemWithCreator);
        } else {
          showToast(result.error || 'Failed to update item', 'error');
        }
      } catch {
        showToast('Failed to update item', 'error');
      }
    },
    [dispatchOptimistic, baseState, showToast]
  );

  const deleteItemOptimistic = useCallback(
    async (itemId: string) => {
      dispatchOptimistic({ type: 'DELETE_ITEM', payload: itemId });
      try {
        const result = await deleteShoppingItem(itemId);
        if (result.success) {
          baseState.deleteItem(itemId);
        } else {
          showToast(result.error || 'Failed to delete item', 'error');
        }
      } catch {
        showToast('Failed to delete item', 'error');
      }
    },
    [dispatchOptimistic, baseState, showToast]
  );

  const updateItemOptimistic = useCallback(
    async (itemId: string, updates: Partial<ShoppingItemWithCreator>) => {
      // We need the full item for the optimistic payload, which is tricky if we only have partial.
      // We can find it in the current optimisticLists.
      const currentList = optimisticLists.find((l) =>
        l.items.some((i) => i.id === itemId)
      );
      const currentItem = currentList?.items.find((i) => i.id === itemId);

      if (currentItem) {
        const updatedItem = { ...currentItem, ...updates };
        dispatchOptimistic({
          type: 'UPDATE_ITEM',
          payload: { itemId, updatedItem },
        });

        try {
          // We need to map ShoppingItemWithCreator partial to UpdateShoppingItemInput
          const result = await updateShoppingItem(itemId, {
            name: updates.name,
            quantity: updates.quantity,
            unit: updates.unit || undefined,
            category: updates.category,
            emoji: updates.emoji || undefined,
            checked: updates.checked,
            productId: updates.productId,
          });

          if (result.success && result.item) {
            baseState.updateItem(
              itemId,
              result.item as ShoppingItemWithCreator
            );
          } else {
            showToast(result.error || 'Failed to update item', 'error');
          }
        } catch {
          showToast('Failed to update item', 'error');
        }
      }
    },
    [optimisticLists, dispatchOptimistic, baseState, showToast]
  );

  return {
    ...baseState,
    lists: optimisticLists, // Override base lists with optimistic ones
    addListOptimistic, // Optional: if we want to wrap list creation
    addItemOptimistic,
    toggleItemOptimistic,
    deleteItemOptimistic,
    updateItemOptimistic,
  };
}
