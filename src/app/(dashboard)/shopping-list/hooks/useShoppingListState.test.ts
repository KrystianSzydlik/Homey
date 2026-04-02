import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShoppingListState } from './useShoppingListState';
import { ShoppingListWithItems } from '@/types/shopping';

const createMockList = (id: string, name: string): ShoppingListWithItems => ({
  id,
  name,
  emoji: '🛒',
  color: null,
  householdId: 'household-1',
  createdById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  position: 0,
  isDefault: false,
  items: [],
  createdBy: { name: 'Test User' },
  _count: { items: 0 },
});

describe('useShoppingListState', () => {
  describe('Multi-Select Support', () => {
    it('should initialize with empty selectedListIds array', () => {
      const { result } = renderHook(() => useShoppingListState([]));
      expect(result.current.selectedListIds).toEqual([]);
    });

    it('should toggle list selection (add if not selected)', () => {
      const lists = [createMockList('a', 'List A'), createMockList('b', 'List B')];
      const { result } = renderHook(() => useShoppingListState(lists));

      act(() => {
        result.current.selectList('a');
      });

      expect(result.current.selectedListIds).toEqual(['a']);
    });

    it('should toggle list selection (remove if selected)', () => {
      const lists = [createMockList('a', 'List A'), createMockList('b', 'List B')];
      const { result } = renderHook(() => useShoppingListState(lists));

      // First select the list
      act(() => {
        result.current.selectList('a');
      });
      expect(result.current.selectedListIds).toEqual(['a']);

      // Then toggle it off
      act(() => {
        result.current.selectList('a');
      });
      expect(result.current.selectedListIds).toEqual([]);
    });

    it('should support multiple selections', () => {
      const lists = [
        createMockList('a', 'List A'),
        createMockList('b', 'List B'),
        createMockList('c', 'List C'),
      ];
      const { result } = renderHook(() => useShoppingListState(lists));

      act(() => {
        result.current.selectList('a');
      });
      expect(result.current.selectedListIds).toEqual(['a']);

      act(() => {
        result.current.selectList('b');
      });
      expect(result.current.selectedListIds).toEqual(['a', 'b']);

      act(() => {
        result.current.selectList('c');
      });
      expect(result.current.selectedListIds).toEqual(['a', 'b', 'c']);
    });

    it('should clear all selections with clearSelection', () => {
      const lists = [createMockList('a', 'List A'), createMockList('b', 'List B')];
      const { result } = renderHook(() => useShoppingListState(lists));

      act(() => {
        result.current.selectList('a');
        result.current.selectList('b');
      });
      expect(result.current.selectedListIds).toEqual(['a', 'b']);

      act(() => {
        result.current.clearSelection();
      });
      expect(result.current.selectedListIds).toEqual([]);
    });

    it('should remove deleted list from selectedListIds', () => {
      const lists = [createMockList('a', 'List A'), createMockList('b', 'List B')];
      const { result } = renderHook(() => useShoppingListState(lists));

      act(() => {
        result.current.selectList('a');
        result.current.selectList('b');
      });
      expect(result.current.selectedListIds).toEqual(['a', 'b']);

      act(() => {
        result.current.deleteList('a');
      });
      expect(result.current.selectedListIds).toEqual(['b']);
    });
  });

  describe('REORDER_LISTS action', () => {
    it('should update lists order in state', () => {
      const lists = [
        createMockList('a', 'List A'),
        createMockList('b', 'List B'),
        createMockList('c', 'List C'),
      ];
      const { result } = renderHook(() => useShoppingListState(lists));

      const reorderedLists = [lists[2], lists[0], lists[1]]; // c, a, b

      act(() => {
        result.current.reorderLists(reorderedLists);
      });

      expect(result.current.lists.map((l) => l.id)).toEqual(['c', 'a', 'b']);
    });

    it('should preserve selectedListIds after reorder', () => {
      const lists = [
        createMockList('a', 'List A'),
        createMockList('b', 'List B'),
        createMockList('c', 'List C'),
      ];
      const { result } = renderHook(() => useShoppingListState(lists));

      act(() => {
        result.current.selectList('a');
        result.current.selectList('c');
      });

      const reorderedLists = [lists[2], lists[0], lists[1]];
      act(() => {
        result.current.reorderLists(reorderedLists);
      });

      expect(result.current.selectedListIds).toEqual(['a', 'c']);
    });
  });

  describe('ADD_LIST action', () => {
    it('should add new list and select it', () => {
      const { result } = renderHook(() => useShoppingListState([]));

      const newList = {
        id: 'new-list',
        name: 'New List',
        emoji: '🆕',
        color: null,
        householdId: 'household-1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        position: 0,
        isDefault: false,
        createdBy: { name: 'Test User' },
        _count: { items: 0 },
      };

      act(() => {
        result.current.addList(newList);
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.selectedListIds).toEqual(['new-list']);
    });
  });
});
