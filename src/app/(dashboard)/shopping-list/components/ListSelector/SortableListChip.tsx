'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLongPress, type Position } from '../../hooks/useLongPress';
import { ShoppingListWithCreator } from '@/types/shopping';
import styles from './ListSelector.module.scss';

interface SortableListChipProps {
  list: ShoppingListWithCreator;
  isSelected: boolean;
  onSelect: (listId: string) => void;
  onContextMenu: (listId: string, position: Position) => void;
}

export default function SortableListChip({
  list,
  isSelected,
  onSelect,
  onContextMenu,
}: SortableListChipProps) {
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
      if (!isDragging) {
        onContextMenu(list.id, position);
      }
    },
    delay: 500,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const handleClick = () => {
    if (!isDragging) {
      onSelect(list.id);
    }
  };

  const handleContextMenuEvent = (e: React.MouseEvent) => {
    longPressHandlers.onContextMenu(e);
  };

  return (
    <button
      ref={setNodeRef}
      style={{
        ...style,
        ...(isSelected && list.color ? { backgroundColor: list.color } : {}),
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenuEvent}
      onTouchStart={longPressHandlers.onTouchStart}
      onTouchMove={longPressHandlers.onTouchMove}
      onTouchEnd={longPressHandlers.onTouchEnd}
      className={`${styles.chip} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      type="button"
      {...attributes}
      {...listeners}
    >
      {list.emoji && <span className={styles.emoji}>{list.emoji}</span>}
      <span className={styles.name}>{list.name}</span>
      <span className={styles.count}>({list._count.items})</span>
    </button>
  );
}
