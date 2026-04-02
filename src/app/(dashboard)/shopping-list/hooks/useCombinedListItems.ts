import { useMemo } from 'react';
import { ShoppingCategory } from '@prisma/client';
import { ShoppingListWithItems, ShoppingItemWithCreator } from '@/types/shopping';

export interface CombinedItem extends ShoppingItemWithCreator {
  sourceList: {
    id: string;
    name: string;
    emoji: string | null;
  };
}

export interface UseCombinedListItemsResult {
  items: CombinedItem[];
  availableCategories: ShoppingCategory[];
}

export function useCombinedListItems(
  lists: ShoppingListWithItems[],
  selectedListIds: string[]
): UseCombinedListItemsResult {
  return useMemo(() => {
    if (selectedListIds.length === 0) {
      return { items: [], availableCategories: [] };
    }

    const selectedLists = lists.filter((list) =>
      selectedListIds.includes(list.id)
    );

    const items: CombinedItem[] = selectedLists.flatMap((list) =>
      list.items.map((item) => ({
        ...item,
        sourceList: {
          id: list.id,
          name: list.name,
          emoji: list.emoji,
        },
      }))
    );

    const categoriesSet = new Set<ShoppingCategory>();
    items.forEach((item) => {
      categoriesSet.add(item.category);
    });

    const availableCategories = Array.from(categoriesSet);

    return { items, availableCategories };
  }, [lists, selectedListIds]);
}
