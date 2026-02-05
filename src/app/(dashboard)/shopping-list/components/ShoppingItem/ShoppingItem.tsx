'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useState } from 'react';
import DropdownMenu from '@/components/shared/DropdownMenu';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { Meta } from './Item.Meta';
import EditItemSheet from '../EditItemSheet/EditItemSheet';
import styles from './ShoppingItem.module.scss';
import { ShoppingItemWithCreator } from '@/types/shopping';

interface SourceListInfo {
  id: string;
  name: string;
  emoji: string | null;
}

interface ShoppingItemProps {
  item: ShoppingItemWithCreator;
  onDelete: (itemId: string) => void;
  onUpdate: (
    itemId: string,
    updatedItem: Partial<ShoppingItemWithCreator>
  ) => void;
  onToggle: (itemId: string, checked: boolean) => void;
  sourceList?: SourceListInfo;
}

export default function ShoppingItem({
  item,
  onDelete,
  onUpdate,
  onToggle,
  sourceList,
}: ShoppingItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

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

  const emoji = item.product?.emoji || item.emoji || '✨'; // Fallback logic

  return (
    <>
      <li
        ref={setNodeRef}
        style={style}
        className={`${styles.item} ${item.checked ? styles.completed : ''} ${
          isDragging ? styles.dragging : ''
        }`}
      >
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          {!item.checked && <span className={styles.dragIcon}>⋮⋮</span>}
        </div>

        <input
          type="checkbox"
          checked={item.checked}
          onChange={handleToggleCheck}
          className={styles.checkbox}
          aria-label={`Mark "${item.name}" as ${
            item.checked ? 'unchecked' : 'checked'
          }`}
        />

        <div className={styles.emoji}>{emoji}</div>

        <div className={styles.content} onClick={() => setShowEditSheet(true)}>
          <div className={styles.name}>{item.name}</div>
          <Meta
            quantity={item.quantity}
            unit={item.unit}
            price={item.price}
            checked={item.checked}
            currency={item.currency || 'PLN'}
          />
        </div>

        <div
          className={`${styles.listBadge} ${sourceList ? styles.visible : ''}`}
        >
          {sourceList && (
            <span title={sourceList.name}>{sourceList.emoji || '📋'}</span>
          )}
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
                onClick: () => setShowEditSheet(true),
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
      </li>

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

      <EditItemSheet
        item={item}
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        onSave={handleUpdate}
      />
    </>
  );
}
