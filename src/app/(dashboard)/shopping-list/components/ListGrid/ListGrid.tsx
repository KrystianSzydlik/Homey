
import React from 'react';
import { ShoppingListWithCreator } from '@/types/shopping';
import styles from './ListGrid.module.scss';

interface ListGridProps {
  lists: ShoppingListWithCreator[];
  onSelectList: (listId: string) => void;
  onOpenCreateModal: () => void;
}

const ListGrid: React.FC<ListGridProps> = ({ lists, onSelectList, onOpenCreateModal }) => {
  return (
    <div className={styles.grid}>
      {lists.map((list) => (
        <div key={list.id} className={styles.card} onClick={() => onSelectList(list.id)}>
          <div className={styles.emoji}>{list.emoji || '🗒️'}</div>
          <div className={styles.name}>{list.name}</div>
          <div className={styles.count}>{list._count.items} item(s)</div>
        </div>
      ))}
      <div className={`${styles.card} ${styles.addCard}`} onClick={onOpenCreateModal}>
        <div className={styles.addIcon}>+</div>
        <div className={styles.addLabel}>Nowa lista</div>
      </div>
    </div>
  );
};

export default ListGrid;
