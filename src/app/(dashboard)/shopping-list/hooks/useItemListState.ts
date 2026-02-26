import { useState, useMemo, useCallback, useTransition } from 'react';
import { ShoppingCategory } from '@prisma/client';
import { ShoppingItemWithCreator } from '@/types/shopping';

interface UseItemListStateOptions {
  items: ShoppingItemWithCreator[];
  availableCategories: ShoppingCategory[];
  onClearCheckedItems: (itemIds: string[]) => Promise<void>;
}

export interface ItemListState {
  selectedCategory: ShoppingCategory | 'ALL';
  setSelectedCategory: (category: ShoppingCategory | 'ALL') => void;
  filteredItems: ShoppingItemWithCreator[];
  uncheckedItems: ShoppingItemWithCreator[];
  checkedItems: ShoppingItemWithCreator[];
  checkedIds: string[];
  missingPriceCount: number;
  isEmpty: boolean;
  isPending: boolean;
  showClearWarning: boolean;
  handleClearCompleted: () => void;
  runClearCompleted: () => void;
  closeClearWarning: () => void;
}

export function useItemListState({
  items,
  availableCategories,
  onClearCheckedItems,
}: UseItemListStateOptions): ItemListState {
  const [selectedCategory, setSelectedCategory] = useState<
    ShoppingCategory | 'ALL'
  >('ALL');
  const [showClearWarning, setShowClearWarning] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'ALL') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const { uncheckedItems, checkedItems } = useMemo(
    () => ({
      uncheckedItems: filteredItems.filter((item) => !item.checked),
      checkedItems: filteredItems.filter((item) => item.checked),
    }),
    [filteredItems]
  );

  const checkedIds = useMemo(
    () => checkedItems.map((item) => item.id),
    [checkedItems]
  );

  const missingPriceCount = useMemo(
    () => checkedItems.filter((item) => item.price === null).length,
    [checkedItems]
  );

  const runClearCompleted = useCallback(() => {
    if (checkedIds.length === 0) return;

    startTransition(async () => {
      await onClearCheckedItems(checkedIds);
      setShowClearWarning(false);
    });
  }, [checkedIds, onClearCheckedItems]);

  const handleClearCompleted = useCallback(() => {
    if (checkedIds.length === 0) return;

    if (missingPriceCount > 0) {
      setShowClearWarning(true);
      return;
    }

    runClearCompleted();
  }, [checkedIds, missingPriceCount, runClearCompleted]);

  const closeClearWarning = useCallback(() => {
    setShowClearWarning(false);
  }, []);

  const isEmpty = uncheckedItems.length === 0 && checkedItems.length === 0;

  return {
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    uncheckedItems,
    checkedItems,
    checkedIds,
    missingPriceCount,
    isEmpty,
    isPending,
    showClearWarning,
    handleClearCompleted,
    runClearCompleted,
    closeClearWarning,
  };
}
