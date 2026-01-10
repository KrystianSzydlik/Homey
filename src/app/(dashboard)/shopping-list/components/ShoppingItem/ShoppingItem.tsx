'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useState, useTransition } from 'react';
import {
  deleteShoppingItem,
  toggleShoppingItemChecked,
  updateShoppingItem,
} from '@/app/lib/shopping-actions';
import { ShoppingItemWithCreator } from '@/types/shopping';
import InlineQuantityEdit from '../InlineQuantityEdit/InlineQuantityEdit';
import styles from './ShoppingItem.module.scss';

interface ShoppingItemProps {
  item: ShoppingItemWithCreator;
  onDelete: (itemId: string) => void;
  onToggle: (itemId: string, updatedItem: ShoppingItemWithCreator) => void;
  onUpdate: (itemId: string, updatedItem: ShoppingItemWithCreator) => void;
}

export default function ShoppingItem({
  item,
  onDelete,
  onToggle,
  onUpdate,
}: ShoppingItemProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [isPending, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const handleToggleCheck = useCallback(() => {
    startTransition(async () => {
      const result = await toggleShoppingItemChecked(item.id);
      if (result.success && result.item) {
        onToggle(item.id, result.item);
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

  const handleSaveNameEdit = useCallback(() => {
    if (editName.trim()) {
      startTransition(async () => {
        const result = await updateShoppingItem(item.id, {
          name: editName.trim(),
        });
        if (result.success && result.item) {
          onUpdate(item.id, result.item);
          setIsEditingName(false);
        }
      });
    }
  }, [item.id, editName, onUpdate]);

  const handleCancelNameEdit = useCallback(() => {
    setEditName(item.name);
    setIsEditingName(false);
  }, [item.name]);

  const handleQuantityUpdate = useCallback(
    (updatedItem: ShoppingItemWithCreator) => {
      onUpdate(item.id, updatedItem);
    },
    [item.id, onUpdate]
  );

  if (isEditingName) {
    return (
      <li className={`${styles.item} ${styles.editing}`}>
        <div className={styles.editForm}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNameEdit();
              if (e.key === 'Escape') handleCancelNameEdit();
            }}
            className={styles.editInput}
            autoFocus
          />
          <div className={styles.editActions}>
            <button
              className={styles.saveButton}
              onClick={handleSaveNameEdit}
              disabled={isPending}
              type="button"
            >
              Save
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleCancelNameEdit}
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
        <div className={styles.itemDetails} onDoubleClick={() => setIsEditingName(true)}>
          {item.emoji && <span className={styles.emoji}>{item.emoji}</span>}
          <div className={styles.text}>
            <div className={styles.name}>{item.name}</div>
          </div>
        </div>
        <InlineQuantityEdit
          itemId={item.id}
          initialQuantity={item.quantity}
          initialUnit={item.unit}
          onUpdate={handleQuantityUpdate}
        />
      </div>
      <div className={styles.actions}>
        <button
          className={styles.editButton}
          onClick={() => setIsEditingName(true)}
          disabled={isPending}
          type="button"
          aria-label={`Edit "${item.name}"`}
          title="Double-click to edit name"
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
