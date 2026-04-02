'use client';

import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  type Position,
} from '@/components/shared/ContextMenu';

interface ListContextMenuProps {
  isOpen: boolean;
  position: Position;
  listId: string;
  listName: string;
  itemCount: number;
  onClearAll: (listId: string) => void;
  onDelete: (listId: string) => void;
  onClose: () => void;
}

export default function ListContextMenu({
  isOpen,
  position,
  listId,
  itemCount,
  onClearAll,
  onDelete,
  onClose,
}: ListContextMenuProps) {
  const handleClearAll = () => {
    onClearAll(listId);
    onClose();
  };

  const handleDelete = () => {
    onDelete(listId);
    onClose();
  };

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <ContextMenuItem
        label="Clear All Items"
        onClick={handleClearAll}
        variant="warning"
        disabled={itemCount === 0}
      />
      <ContextMenuSeparator />
      <ContextMenuItem
        label="Delete List"
        onClick={handleDelete}
        variant="danger"
      />
    </ContextMenu>
  );
}
