import { useOptimistic } from 'react';
import { useToast } from '@/components/ToastContainer';
import {
  ShoppingListWithItems,
  ShoppingItem as ShoppingItemType,
} from '@/types/shopping';
import { useShoppingListState } from './useShoppingListState';
import {
  toggleShoppingItemChecked,
  deleteShoppingItem,
  addShoppingItem,
  updateShoppingItem,
} from '@/app/lib/shopping-actions';

type OptimisticAction =
  | { type: 'TOGGLE_ITEM'; payload: { itemId: string; checked: boolean } }
  | { type: 'DELETE_ITEM'; payload: { itemId: string } }
  | { type: 'ADD_ITEM'; payload: ShoppingItemType }
  | {
      type: 'UPDATE_ITEM';
      payload: { itemId: string; updates: Partial<ShoppingItemType> };
    };

export function useOptimisticShoppingList(
  initialLists: ShoppingListWithItems[]
) {
  const baseState = useShoppingListState(initialLists);
  const { showToast } = useToast();

  const [optimisticItems, dispatchOptimisticUpdate] = useOptimistic<
    ShoppingItemType[],
    OptimisticAction
  >(baseState.itemsToRender, (state, action) => {
    switch (action.type) {
      case 'TOGGLE_ITEM':
        return state.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, checked: action.payload.checked }
            : item
        );
      case 'DELETE_ITEM':
        return state.filter((item) => item.id !== action.payload.itemId);
      case 'ADD_ITEM':
        // Note: The temporary item should be added to the correct list's items,
        // this logic needs to be handled carefully in the component layer or hook.
        return [...state, action.payload];
      case 'UPDATE_ITEM':
        return state.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, ...action.payload.updates }
            : item
        );
      default:
        return state;
    }
  });

  const toggleItemOptimistic = async (itemId: string, checked: boolean) => {
    dispatchOptimisticUpdate({ type: 'TOGGLE_ITEM', payload: { itemId, checked } });
    const result = await toggleShoppingItemChecked(itemId);
    if (!result.success) {
      showToast('Error updating item', 'error');
    }
  };

  const deleteItemOptimistic = async (itemId: string) => {
    dispatchOptimisticUpdate({ type: 'DELETE_ITEM', payload: { itemId } });
    const result = await deleteShoppingItem(itemId);
    if (!result.success) {
      showToast('Error deleting item', 'error');
    }
  };

  const addItemOptimistic = async (
    listId: string,
    name: string,
    productId?: string
  ) => {
    // Create a temporary item for the optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempItem: ShoppingItemType = {
      id: tempId,
      name,
      quantity: '1',
      unit: null,
      checked: false,
      shoppingListId: listId,
      productId: productId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: productId ? { id: productId, name, emoji: '✨' } : null,
      sortOrder: baseState.itemsToRender.length,
    };

    dispatchOptimisticUpdate({ type: 'ADD_ITEM', payload: tempItem });

    const result = await addShoppingItem(listId, name, productId);
    if (!result.success) {
      showToast('Error adding item', 'error');
      // The state will auto-revert, removing the temp item
    } else {
      // We might need to replace the temp item with the real one from the server
      // For now, we'll rely on a full state refresh from the parent component
      // to handle this.
      baseState.refreshLists();
    }
  };

  const updateItemOptimistic = async (
    itemId: string,
    updates: Partial<ShoppingItemType>
  ) => {
    dispatchOptimisticUpdate({ type: 'UPDATE_ITEM', payload: { itemId, updates } });
    const result = await updateShoppingItem(itemId, updates);
    if (!result.success) {
      showToast('Error updating item', 'error');
    }
  };


  return {
    ...baseState,
    itemsToRender: optimisticItems,
    toggleItemOptimistic,
    deleteItemOptimistic,
    addItemOptimistic,
    updateItemOptimistic,
  };
}
