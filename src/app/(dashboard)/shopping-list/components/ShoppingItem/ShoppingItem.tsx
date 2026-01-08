'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ShoppingItem as ShoppingItemType } from '@prisma/client';
import { useCallback, useState, useTransition } from 'react';
import {
  deleteShoppingItem,
  toggleShoppingItemChecked,
  updateShoppingItem,
} from '@/app/lib/shopping-actions';
import styles from './ShoppingItem.module.scss';

interface ShoppingItemProps {
  item: ShoppingItemType & {
    createdBy: { name: string };
  };
  onDelete: (itemId: string) => void;
  onToggle: (itemId: string, updatedItem: ShoppingItemType & { createdBy: { name: string } }) => void;
  onUpdate: (itemId: string, updatedItem: ShoppingItemType & { createdBy: { name: string } }) => void;
}

export default function ShoppingItem({
  item,
  onDelete,
  onToggle,
  onUpdate,
}: ShoppingItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const handleToggleCheck = useCallback(() => {
    startTransition(async () => {
      const result = await toggleShoppingItemChecked(item.id);
      if (result.success && result.item) {
        onToggle(item.id, result.item as any);
      }
    });
  }, [item.id, onToggle]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Delete "${item.name}"?`)) {
      startTransition(async () => {
        const result = await deleteShoppingItem(item.id);
        if (result.success) {
          onDelete(item.id);
        }
      });
    }
  }, [item.id, item.name, onDelete]);

  const handleSaveEdit = useCallback(() => {
    if (editName.trim()) {
      startTransition(async () => {
        const result = await updateShoppingItem(item.id, {
          name: editName.trim(),
          quantity: editQuantity,
        });
        if (result.success && result.item) {
          onUpdate(item.id, result.item as any);
          setIsEditing(false);
        }
      });
    }
  }, [item.id, editName, editQuantity, onUpdate]);

  const handleCancelEdit = useCallback(() => {
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setIsEditing(false);
  }, [item.name, item.quantity]);

  if (isEditing) {
    return (
      <li className={`${styles.item} ${styles.editing}`}>
        <div className={styles.editForm}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className={styles.editInput}
            autoFocus
          />
          <input
            type="text"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            className={styles.editQuantityInput}
            placeholder="Qty"
          />
          <div className={styles.editActions}>
            <button
              className={styles.saveButton}
              onClick={handleSaveEdit}
              disabled={isPending}
              type="button"
            >
              Save
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleCancelEdit}
              disabled={isPending}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

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
      {...attributes}
      {...listeners}
    >
      <div className={styles.content}>
        <input
          type="checkbox"
          checked={item.checked}
          onChange={handleToggleCheck}
          disabled={isPending}
          className={styles.checkbox}
          aria-label={`Mark "${item.name}" as ${item.checked ? 'unchecked' : 'checked'}`}
        />
        <div className={styles.itemDetails} onDoubleClick={() => setIsEditing(true)}>
          {item.emoji && <span className={styles.emoji}>{item.emoji}</span>}
          <div className={styles.text}>
            <div className={styles.name}>{item.name}</div>
            {item.quantity && (
              <div className={styles.quantity}>
                {item.quantity} {item.unit ? item.unit : 'pcs'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.editButton}
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          type="button"
          aria-label={`Edit "${item.name}"`}
          title="Double-click to edit"
        >
          ✏️
        </button>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isPending}
          type="button"
          aria-label={`Delete "${item.name}"`}
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
