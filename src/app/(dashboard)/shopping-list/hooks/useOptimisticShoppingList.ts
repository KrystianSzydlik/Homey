'use client';

import { useOptimistic, Reducer } from 'react';
import {
  ShoppingItemWithCreator,
  ShoppingListWithItems,
  ShoppingListWithCreator,
  ShoppingItemInput,
} from '@/types/shopping';
import { useShoppingListState } from './useShoppingListState';
import { useToast } from '@/components/ToastContainer/ToastContainer';
import {
  toggleShoppingItemChecked,
  deleteShoppingItem,
  createShoppingItem,
  updateShoppingItem,
  clearCheckedItems as clearCheckedItemsAction,
  deleteAllShoppingItems,
} from '@/app/lib/shopping-actions';
import {
  deleteShoppingList,
  createShoppingList as createShoppingListAction,
} from '@/app/lib/shopping-list-actions';

type OptimisticAction =
  | { type: 'TOGGLE_ITEM'; payload: { itemId: string; checked: boolean } }
  | { type: 'DELETE_ITEM'; payload: { itemId: string } }
  | { type: 'ADD_ITEM'; payload: { item: ShoppingItemWithCreator } }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; updatedData: Partial<ShoppingItemWithCreator> } }
  | { type: 'ADD_LIST'; payload: { list: ShoppingListWithItems } }
  | { type: 'DELETE_LIST'; payload: { listId: string } }
  | { type: 'CLEAR_CHECKED' }
  | { type: 'DELETE_ALL_ITEMS'; payload: { listId: string } }
  | { type: 'SET_LISTS'; payload: ShoppingListWithItems[] };

// This optimistic hook will wrap the existing state logic
export function useOptimisticShoppingList(initialLists: ShoppingListWithItems[]) {
  const { showToast } = useToast();

  const {
    lists,
    selectedListIds,
    addList,
    deleteList,
    toggleListSelection,
    addItem,
    deleteItem,
    updateItem,
    clearCheckedItems,
    deleteAllItems,
  } = useShoppingListState(initialLists);

  const optimisticReducer: Reducer<ShoppingListWithItems[], OptimisticAction> = (state, { type, payload }) => {
    switch (type) {
      case 'TOGGLE_ITEM':
        return state.map(list => ({
          ...list,
          items: list.items.map(item =>
            item.id === payload.itemId ? { ...item, checked: payload.checked } : item
          ),
        }));
      case 'DELETE_ITEM':
        return state.map(list => ({
          ...list,
          items: list.items.filter(item => item.id !== payload.itemId),
        }));
      case 'ADD_ITEM':
        return state.map(list =>
          list.id === payload.item.shoppingListId
            ? { ...list, items: [...list.items, payload.item] }
            : list
        );
      case 'UPDATE_ITEM':
          return state.map(list => ({
            ...list,
            items: list.items.map(item =>
              item.id === payload.itemId ? { ...item, ...payload.updatedData } : item
            ),
          }));
      case 'ADD_LIST':
        return [...state, payload.list];
      case 'DELETE_LIST':
        return state.filter(list => list.id !== payload.listId);
      case 'CLEAR_CHECKED':
        return state.map(list => ({
          ...list,
          items: list.items.filter(item => !item.checked)
        }));
      case 'DELETE_ALL_ITEMS':
        return state.map(list =>
            list.id === payload.listId ? { ...list, items: [] } : list
        );
      case 'SET_LISTS':
        return payload;
      default:
        return state;
    }
  };

  const [optimisticLists, dispatchOptimistic] = useOptimistic(lists, optimisticReducer);

  const toggleItemOptimistic = async (itemId: string, currentChecked: boolean) => {
    const previousLists = optimisticLists;
    dispatchOptimistic({ type: 'TOGGLE_ITEM', payload: { itemId, checked: !currentChecked } });
    const result = await toggleShoppingItemChecked(itemId);
    if (!result.success) {
      showToast('Error updating item', 'error');
      dispatchOptimistic({ type: 'SET_LISTS', payload: previousLists });
    }
  };

  const deleteItemOptimistic = async (itemId: string) => {
    const previousLists = optimisticLists;
    dispatchOptimistic({ type: 'DELETE_ITEM', payload: { itemId } });
    const result = await deleteShoppingItem(itemId);
    if (result.success) {
      deleteItem(itemId);
    } else {
      showToast('Error deleting item', 'error');
      dispatchOptimistic({ type: 'SET_LISTS', payload: previousLists });
    }
  };

  const addItemOptimistic = async (listId: string, newItem: ShoppingItemInput, tempId: string) => {
    const tempItem: ShoppingItemWithCreator = {
      id: tempId,
      name: newItem.name,
      quantity: newItem.quantity || '1',
      unit: newItem.unit || null,
      category: newItem.category || 'OTHER',
      emoji: newItem.emoji || '✨',
      checked: false,
      position: 999,
      shoppingListId: listId,
      productId: newItem.productId || null,
      householdId: '',
      createdById: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      purchaseCount: 0,
      lastPurchasedAt: null,
      averageDaysBetweenPurchases: null,
      createdBy: { name: 'You' },
    };

    const previousLists = optimisticLists;
    dispatchOptimistic({ type: 'ADD_ITEM', payload: { item: tempItem } });

    const result = await createShoppingItem({ ...newItem, shoppingListId: listId });
    if (result.success && result.item) {
      updateItem(tempId, result.item);
    } else {
      showToast(result.error || 'Error adding item', 'error');
      dispatchOptimistic({ type: 'SET_LISTS', payload: previousLists });
    }
  };

  const updateItemOptimistic = async (itemId: string, updatedData: Partial<ShoppingItemWithCreator>) => {
    const previousLists = optimisticLists;
    dispatchOptimistic({ type: 'UPDATE_ITEM', payload: { itemId, updatedData }});
    const result = await updateShoppingItem(itemId, updatedData);
    if (result.success && result.item) {
        updateItem(itemId, result.item);
    } else {
        showToast('Error updating item', 'error');
        dispatchOptimistic({ type: 'SET_LISTS', payload: previousLists });
    }
  };

  const addListOptimistic = async (name: string, emoji: string) => {
    const tempList: ShoppingListWithItems = {
      id: `temp-${Date.now()}`,
      name,
      emoji,
      color: null,
      position: 999,
      isDefault: false,
      householdId: '',
      createdById: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      createdBy: { name: 'You' },
      _count: { items: 0 },
    };

    const previousLists = optimisticLists;
    dispatchOptimistic({ type: 'ADD_LIST', payload: { list: tempList } });
    const result = await createShoppingListAction({ name, emoji });
    if (result.success && result.list) {
      addList(result.list);
    } else {
      showToast('Error creating list', 'error');
      dispatchOptimistic({ type: 'SET_LISTS', payload: previousLists });
    }
  };

  const deleteListOptimistic = async (listId: string) => {
    const previousLists = optimisticLists;
    dispatchOptimistic({ type: 'DELETE_LIST', payload: { listId } });
    const result = await deleteShoppingList(listId);
    if (result.success) {
      deleteList(listId);
    } else {
      showToast('Error deleting list', 'error');
      dispatchOptimistic({ type: 'SET_LISTS', payload: previousLists });
    }
  };

  const clearCheckedOptimistic = async () => {
    const previousLists = optimisticLists;
    dispatchOptimistic({ type: 'CLEAR_CHECKED' });
    const result = await clearCheckedItemsAction();
    if (result.success) {
      clearCheckedItems();
    } else {
      showToast('Error clearing items', 'error');
      dispatchOptimistic({ type: 'SET_LISTS', payload: previousLists });
    }
  };

  const deleteAllItemsOptimistic = async (listId: string) => {
      const previousLists = optimisticLists;
      dispatchOptimistic({ type: 'DELETE_ALL_ITEMS', payload: { listId } });
      const result = await deleteAllShoppingItems(listId);
      if(result.success) {
          deleteAllItems(listId);
      } else {
          showToast('Error deleting all items', 'error');
          dispatchOptimistic({ type: 'SET_LISTS', payload: previousLists });
      }
  };

  return {
    lists: optimisticLists,
    selectedListIds,
    toggleListSelection,
    reorderItems, // Assuming dnd-kit handles its own optimistic updates
    // Optimistic action wrappers
    toggleItemOptimistic,
    deleteItemOptimistic,
    addItemOptimistic,
    updateItemOptimistic,
    addListOptimistic,
    deleteListOptimistic,
    clearCheckedOptimistic,
    deleteAllItemsOptimistic,
    // Original state modifiers for sync
    addList,
    deleteList,
    addItem,
    deleteItem,
    updateItem,
    clearCheckedItems,
    deleteAllItems,
  };
}
