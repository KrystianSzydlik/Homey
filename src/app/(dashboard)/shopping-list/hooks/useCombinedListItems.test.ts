import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCombinedListItems } from './useCombinedListItems';
import { ShoppingListWithItems } from '@/types/shopping';
import { ShoppingCategory } from '@prisma/client';

const createMockItem = (
  id: string,
  name: string,
  listId: string,
  category: ShoppingCategory = 'OTHER'
) => ({
  id,
  name,
  shoppingListId: listId,
  category,
  quantity: '1',
  unit: null,
  emoji: null,
  note: null,
  checked: false,
  position: 0,
  householdId: 'household-1',
  createdById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  productId: 'product-1',
  createdBy: { name: 'Test User' },
  shoppingList: { name: 'Test List', emoji: null },
  product: null,
});

const createMockList = (
  id: string,
  name: string,
  emoji: string | null,
  items: ReturnType<typeof createMockItem>[]
): ShoppingListWithItems => ({
  id,
  name,
  emoji,
  color: null,
  householdId: 'household-1',
  createdById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  position: 0,
  isDefault: false,
  items,
  createdBy: { name: 'Test User' },
  _count: { items: items.length },
});

describe('useCombinedListItems', () => {
  it('should return empty items when no lists selected', () => {
    const lists = [
      createMockList('a', 'List A', '🛒', [
        createMockItem('item-1', 'Milk', 'a'),
      ]),
    ];

    const { result } = renderHook(() => useCombinedListItems(lists, []));

    expect(result.current.items).toEqual([]);
    expect(result.current.availableCategories).toEqual([]);
  });

  it('should merge items from selected lists', () => {
    const lists = [
      createMockList('a', 'List A', '🛒', [
        createMockItem('item-1', 'Milk', 'a', 'DAIRY'),
      ]),
      createMockList('b', 'List B', '🍎', [
        createMockItem('item-2', 'Apple', 'b', 'FRUITS'),
      ]),
      createMockList('c', 'List C', '🥬', [
        createMockItem('item-3', 'Carrot', 'c', 'VEGETABLES'),
      ]),
    ];

    const { result } = renderHook(() =>
      useCombinedListItems(lists, ['a', 'b'])
    );

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.map((i) => i.name)).toEqual(['Milk', 'Apple']);
  });

  it('should annotate items with sourceList info', () => {
    const lists = [
      createMockList('a', 'List A', '🛒', [
        createMockItem('item-1', 'Milk', 'a'),
      ]),
    ];

    const { result } = renderHook(() => useCombinedListItems(lists, ['a']));

    expect(result.current.items[0].sourceList).toEqual({
      id: 'a',
      name: 'List A',
      emoji: '🛒',
    });
  });

  it('should compute combined availableCategories', () => {
    const lists = [
      createMockList('a', 'List A', '🛒', [
        createMockItem('item-1', 'Milk', 'a', 'DAIRY'),
        createMockItem('item-2', 'Cheese', 'a', 'DAIRY'),
      ]),
      createMockList('b', 'List B', '🍎', [
        createMockItem('item-3', 'Apple', 'b', 'FRUITS'),
        createMockItem('item-4', 'Banana', 'b', 'FRUITS'),
      ]),
    ];

    const { result } = renderHook(() =>
      useCombinedListItems(lists, ['a', 'b'])
    );

    expect(result.current.availableCategories).toHaveLength(2);
    expect(result.current.availableCategories).toContain('DAIRY');
    expect(result.current.availableCategories).toContain('FRUITS');
  });

  it('should return items from a single list when only one is selected', () => {
    const lists = [
      createMockList('a', 'List A', '🛒', [
        createMockItem('item-1', 'Milk', 'a'),
        createMockItem('item-2', 'Bread', 'a'),
      ]),
    ];

    const { result } = renderHook(() => useCombinedListItems(lists, ['a']));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.map((i) => i.name)).toEqual(['Milk', 'Bread']);
  });
});
