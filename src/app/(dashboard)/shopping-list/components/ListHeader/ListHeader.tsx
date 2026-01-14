'use client';

import { ShoppingListWithCreator } from '@/types/shopping';
import DropdownMenu, {
  DropdownMenuItem,
} from '@/components/shared/DropdownMenu';
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
  const menuItems: DropdownMenuItem[] = [
    {
      label: 'Clear All Items',
      onClick: () => onDeleteAll(list.id),
      variant: 'warning',
      disabled: itemCount === 0 || isLoading,
    },
    {
      label: 'Delete List',
      onClick: () => onDelete(list.id),
      variant: 'danger',
      disabled: isLoading,
    },
  ];

  return (
    <div
      className={styles.listHeader}
      style={
        list.color
          ? {
              background: `linear-gradient(135deg, ${list.color}26 0%, ${list.color}0d 100%)`,
              borderBottomColor: `${list.color}1a`,
            }
          : undefined
      }
    >
      <div className={styles.listHeaderContent}>
        {list.emoji && <span className={styles.listEmoji}>{list.emoji}</span>}
        <h2 className={styles.listTitle}>{list.name}</h2>
        <span className={styles.listCount}>({itemCount})</span>
      </div>

      <div className={styles.actions}>
        <DropdownMenu items={menuItems} align="right" disabled={isLoading} />
      </div>
    </div>
  );
}
