'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useState } from 'react';
import DropdownMenu from '@/components/shared/DropdownMenu';
import InlineNameEdit from '../InlineNameEdit/InlineNameEdit';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import InlineQuantityEdit from '../InlineQuantityEdit/InlineQuantityEdit';
import styles from './ShoppingItem.module.scss';
import { ShoppingItemWithCreator } from '@/types/shopping';

interface ShoppingItemProps {
  item: ShoppingItemWithCreator;
  onDelete: (itemId: string) => void;
  onUpdate: (
    itemId: string,
    updatedItem: Partial<ShoppingItemWithCreator>
  ) => void;
  onToggle: (itemId: string, checked: boolean) => void;
}

export default function ShoppingItem({
  item,
  onDelete,
  onUpdate,
  onToggle,
}: ShoppingItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: item.checked });

  const handleToggleCheck = useCallback(() => {
    onToggle(item.id, !item.checked);
  }, [item.id, item.checked, onToggle]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    // No transition needed, modal closes instantly
    setShowDeleteConfirm(false);
    onDelete(item.id);
  }, [item.id, onDelete]);

  const handleUpdate = useCallback(
    (updatedFields: Partial<ShoppingItemWithCreator>) => {
      onUpdate(item.id, updatedFields);
    },
    [item.id, onUpdate]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const emoji = item.product?.emoji || '✨';

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${item.checked ? styles.completed : ''} ${
        isDragging ? styles.dragging : ''
      }`}
    >
      {!item.checked && (
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          <span className={styles.dragIcon}>⋮⋮</span>
        </div>
      )}
      <div className={styles.content}>
        <input
          type="checkbox"
          checked={item.checked}
          onChange={handleToggleCheck}
          className={styles.checkbox}
          aria-label={`Mark "${item.name}" as ${
            item.checked ? 'unchecked' : 'checked'
          }`}
        />
        <div className={styles.itemDetails}>
          <span className={styles.emoji}>{emoji}</span>
          <div className={styles.text}>
            <InlineNameEdit
              itemId={item.id}
              initialName={item.name}
              onUpdate={handleUpdate}
              isCompleted={item.checked}
              isEditing={isEditing}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
        <InlineQuantityEdit
          itemId={item.id}
          initialQuantity={item.quantity}
          initialUnit={item.unit}
          onUpdate={handleUpdate}
        />
      </div>
      <div
        className={styles.actions}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <DropdownMenu
          align="right"
          items={[
            {
              label: 'Edytuj',
              onClick: () => setIsEditing(true),
              icon: <span>✏️</span>,
            },
            {
              label: 'Usuń',
              onClick: handleDeleteClick,
              variant: 'danger',
              icon: <span>🗑️</span>,
            },
          ]}
        />
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Delete Item"
          message={`Are you sure you want to delete "${item.name}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </li>
  );
}
