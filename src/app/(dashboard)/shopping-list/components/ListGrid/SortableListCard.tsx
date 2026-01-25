'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLongPress, type Position } from '../../hooks/useLongPress';
import { ShoppingListWithCreator } from '@/types/shopping';
import styles from './ListGrid.module.scss';

interface SortableListCardProps {
  list: ShoppingListWithCreator;
  onSelect: (listId: string) => void;
  onContextMenu: (listId: string, position: Position) => void;
}

export default function SortableListCard({
  list,
  onSelect,
  onContextMenu,
}: SortableListCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const longPressHandlers = useLongPress({
    onLongPress: (position) => {
      // Only trigger context menu if not dragging
      if (!isDragging) {
        onContextMenu(list.id, position);
      }
    },
    delay: 500, // 500ms for context menu
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const handleClick = () => {
    // Don't trigger selection if we were dragging
    if (!isDragging) {
      onSelect(list.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    longPressHandlers.onContextMenu(e);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={longPressHandlers.onTouchStart}
      onTouchMove={longPressHandlers.onTouchMove}
      onTouchEnd={longPressHandlers.onTouchEnd}
      {...attributes}
      {...listeners}
    >
      <div className={styles.emoji}>{list.emoji}</div>
      <div className={styles.name}>{list.name}</div>
      <div className={styles.count}>{list._count.items} produktów</div>
    </div>
  );
}
