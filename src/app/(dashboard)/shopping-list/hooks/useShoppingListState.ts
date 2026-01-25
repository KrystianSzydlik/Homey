import { useReducer, useCallback } from 'react';
import {
  ShoppingItemWithCreator,
  ShoppingListWithItems,
  ShoppingListWithCreator,
} from '@/types/shopping';

type ShoppingListState = {
  lists: ShoppingListWithItems[];
  selectedListIds: string[];
};

type ShoppingListAction =
  | { type: 'SET_LISTS'; payload: ShoppingListWithItems[] }
  | { type: 'ADD_LIST'; payload: ShoppingListWithCreator }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'SELECT_LIST'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'REORDER_LISTS'; payload: ShoppingListWithItems[] }
  | { type: 'ADD_ITEM'; payload: ShoppingItemWithCreator }
  | { type: 'DELETE_ITEM'; payload: string }
  | {
      type: 'UPDATE_ITEM';
      payload: { itemId: string; updatedItem: ShoppingItemWithCreator };
    }
  | {
      type: 'REORDER_ITEMS';
      payload: { listId: string; items: ShoppingItemWithCreator[] };
    }
  | { type: 'CLEAR_CHECKED_ITEMS' }
  | { type: 'DELETE_ALL_ITEMS'; payload: string };

function shoppingListReducer(
  state: ShoppingListState,
  action: ShoppingListAction
): ShoppingListState {
  switch (action.type) {
    case 'SET_LISTS':
      return {
        ...state,
        lists: action.payload,
      };

    case 'ADD_LIST':
      return {
        lists: [...state.lists, { ...action.payload, items: [] }],
        selectedListIds: [...state.selectedListIds, action.payload.id],
      };

    case 'DELETE_LIST': {
      const newLists = state.lists.filter((list) => list.id !== action.payload);
      return {
        lists: newLists,
        selectedListIds: state.selectedListIds.filter((id) => id !== action.payload),
      };
    }

    case 'SELECT_LIST': {
      const isSelected = state.selectedListIds.includes(action.payload);
      return {
        ...state,
        selectedListIds: isSelected
          ? state.selectedListIds.filter((id) => id !== action.payload)
          : [...state.selectedListIds, action.payload],
      };
    }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedListIds: [],
      };

    case 'REORDER_LISTS':
      return {
        ...state,
        lists: action.payload,
      };

    case 'ADD_ITEM':
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.shoppingListId
            ? { ...list, items: [...list.items, action.payload] }
            : list
        ),
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        lists: state.lists.map((list) => ({
          ...list,
          items: list.items.filter((item) => item.id !== action.payload),
        })),
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        lists: state.lists.map((list) =>
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
        ),
      };

    case 'REORDER_ITEMS':
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.listId
            ? { ...list, items: action.payload.items }
            : list
        ),
      };

    case 'CLEAR_CHECKED_ITEMS':
      return {
        ...state,
        lists: state.lists.map((list) => ({
          ...list,
          items: list.items.filter((item) => !item.checked),
        })),
      };

    case 'DELETE_ALL_ITEMS':
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload ? { ...list, items: [] } : list
        ),
      };

    default:
      return state;
  }
}

export function useShoppingListState(initialLists: ShoppingListWithItems[]) {
  const [state, dispatch] = useReducer(shoppingListReducer, {
    lists: initialLists,
    selectedListIds: [],
  });

  const addList = useCallback((list: ShoppingListWithCreator) => {
    dispatch({ type: 'ADD_LIST', payload: list });
  }, []);

  const deleteList = useCallback((listId: string) => {
    dispatch({ type: 'DELETE_LIST', payload: listId });
  }, []);

  const selectList = useCallback((listId: string) => {
    dispatch({ type: 'SELECT_LIST', payload: listId });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const reorderLists = useCallback((lists: ShoppingListWithItems[]) => {
    dispatch({ type: 'REORDER_LISTS', payload: lists });
  }, []);

  const addItem = useCallback((item: ShoppingItemWithCreator) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: itemId });
  }, []);

  const updateItem = useCallback(
    (itemId: string, updatedItem: ShoppingItemWithCreator) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { itemId, updatedItem } });
    },
    []
  );

  const reorderItems = useCallback(
    (listId: string, items: ShoppingItemWithCreator[]) => {
      dispatch({ type: 'REORDER_ITEMS', payload: { listId, items } });
    },
    []
  );

  const clearCheckedItems = useCallback(() => {
    dispatch({ type: 'CLEAR_CHECKED_ITEMS' });
  }, []);

  const deleteAllItems = useCallback((listId: string) => {
    dispatch({ type: 'DELETE_ALL_ITEMS', payload: listId });
  }, []);

  return {
    lists: state.lists,
    selectedListIds: state.selectedListIds,
    addList,
    deleteList,
    selectList,
    clearSelection,
    reorderLists,
    addItem,
    deleteItem,
    updateItem,
    reorderItems,
    clearCheckedItems,
    deleteAllItems,
  };
}
