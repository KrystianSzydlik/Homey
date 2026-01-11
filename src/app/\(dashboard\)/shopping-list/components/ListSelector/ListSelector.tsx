'use client';

import { useCallback } from 'react';
import { ShoppingListWithCreator } from '@/types/shopping';
import styles from './ListSelector.module.scss';

interface ListSelectorProps {
  lists: ShoppingListWithCreator[];
  selectedListIds: string[];
  onSelectList: (listId: string) => void;
  onOpenCreateModal: () => void;
}

export default function ListSelector({
  lists,
  selectedListIds,
  onSelectList,
  onOpenCreateModal,
}: ListSelectorProps) {
  const handleToggleList = useCallback(
    (listId: string) => {
      onSelectList(listId);
    },
    [onSelectList]
  );

  return (
    <div className={styles.container}>
      <div className={styles.scroller}>
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => handleToggleList(list.id)}
            className={`${styles.chip} ${
              selectedListIds.includes(list.id) ? styles.selected : ''
            }`}
            style={
              selectedListIds.includes(list.id) && list.color
                ? { backgroundColor: list.color }
                : undefined
            }
            type="button"
          >
            {list.emoji && <span className={styles.emoji}>{list.emoji}</span>}
            <span className={styles.name}>{list.name}</span>
            <span className={styles.count}>({list._count.items})</span>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenCreateModal}
        className={styles.addButton}
        type="button"
        title="Create new shopping list"
        aria-label="Create new shopping list"
      >
        +
      </button>
    </div>
  );
}
