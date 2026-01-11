'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useState, useTransition } from 'react';
import {
  deleteShoppingItem,
  toggleShoppingItemChecked,
} from '@/app/lib/shopping-actions';
import { ShoppingItemWithCreator } from '@/types/shopping';
import InlineQuantityEdit from '../InlineQuantityEdit/InlineQuantityEdit';
import InlineNameEdit from '../InlineNameEdit/InlineNameEdit';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import styles from './ShoppingItem.module.scss';

interface ShoppingItemProps {
  item: ShoppingItemWithCreator;
  onDelete: (itemId: string) => void;
  onUpdate: (itemId: string, updatedItem: ShoppingItemWithCreator) => void;
}

export default function ShoppingItem({
  item,
  onDelete,
  onUpdate,
}: ShoppingItemProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const handleToggleCheck = useCallback(() => {
    startTransition(async () => {
      const result = await toggleShoppingItemChecked(item.id);
      if (result.success && result.item) {
        onUpdate(item.id, result.item);
      }
    });
  }, [item.id, onUpdate]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    startTransition(async () => {
      const result = await deleteShoppingItem(item.id);
      if (result.success) {
        onDelete(item.id);
        setShowDeleteConfirm(false);
      }
    });
  }, [item.id, onDelete]);

  const handleUpdate = useCallback(
    (updatedItem: ShoppingItemWithCreator) => {
      onUpdate(item.id, updatedItem);
    },
    [item.id, onUpdate]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${item.checked ? styles.completed : ''} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <span className={styles.dragIcon}>⋮⋮</span>
      </div>
      <div className={styles.content}>
        <input
          type="checkbox"
          checked={item.checked}
          onChange={handleToggleCheck}
          disabled={isPending}
          className={styles.checkbox}
          aria-label={`Mark "${item.name}" as ${item.checked ? 'unchecked' : 'checked'}`}
        />
        <div className={styles.itemDetails}>
          {item.emoji && <span className={styles.emoji}>{item.emoji}</span>}
          <div className={styles.text}>
            <InlineNameEdit
              itemId={item.id}
              initialName={item.name}
              onUpdate={handleUpdate}
              isCompleted={item.checked}
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
        <button
          className={styles.deleteButton}
          onClick={handleDeleteClick}
          disabled={isPending}
          type="button"
          aria-label={`Delete "${item.name}"`}
        >
          🗑️
        </button>
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
          isLoading={isPending}
        />
      )}
    </li>
  );
}
