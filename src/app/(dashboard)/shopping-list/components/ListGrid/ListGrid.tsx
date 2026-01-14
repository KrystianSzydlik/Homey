'use client';

import { ShoppingListWithCreator } from '@/types/shopping';
import styles from './ListGrid.module.scss';

interface ListGridProps {
  lists: ShoppingListWithCreator[];
  onSelectList: (listId: string) => void;
  onOpenCreateModal: () => void;
}

export default function ListGrid({
  lists,
  onSelectList,
  onOpenCreateModal,
}: ListGridProps) {
  return (
    <div className={styles.grid}>
      {lists.map((list) => (
        <div
          key={list.id}
          className={styles.card}
          onClick={() => onSelectList(list.id)}
        >
          <div className={styles.emoji}>{list.emoji}</div>
          <div className={styles.name}>{list.name}</div>
          <div className={styles.count}>{list._count.items} items</div>
        </div>
      ))}
      <div className={styles.card} onClick={onOpenCreateModal}>
        <div className={styles.addIcon}>+</div>
        <div className={styles.name}>New List</div>
      </div>
    </div>
  );
}
