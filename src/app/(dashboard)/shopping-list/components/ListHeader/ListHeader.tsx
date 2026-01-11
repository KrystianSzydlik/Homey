'use client';

import { ShoppingListWithCreator } from '@/types/shopping';
import styles from './ListHeader.module.scss';

interface ListHeaderProps {
  list: ShoppingListWithCreator;
  itemCount: number;
  onDelete: (listId: string) => void;
  onDeleteAll: (listId: string) => void;
  isLoading?: boolean;
}

export default function ListHeader({
  list,
  itemCount,
  onDelete,
  onDeleteAll,
  isLoading = false,
}: ListHeaderProps) {
  return (
    <div
      className={styles.listHeader}
      style={list.color ? { backgroundColor: list.color } : undefined}
    >
      <div className={styles.listHeaderContent}>
        {list.emoji && <span className={styles.listEmoji}>{list.emoji}</span>}
        <h2 className={styles.listTitle}>{list.name}</h2>
        <span className={styles.listCount}>({itemCount})</span>
      </div>

      <div className={styles.actions}>
        {itemCount > 0 && (
          <button
            type="button"
            className={styles.deleteAllButton}
            onClick={() => onDeleteAll(list.id)}
            disabled={isLoading}
            title="Delete all items in this list"
          >
            Clear All
          </button>
        )}

        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onDelete(list.id)}
          disabled={isLoading}
          title="Delete this list"
        >
          Delete List
        </button>
      </div>
    </div>
  );
}
