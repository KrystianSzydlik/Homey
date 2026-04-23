'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import DropdownMenu from '@/components/shared/DropdownMenu';
import CircularCheckbox from '@/components/shared/CircularCheckbox';
import { AlertModal } from '@/components/shared/Modal';
import { Meta } from './Item.Meta';
import ItemBottomSheet from '../ItemBottomSheet/ItemBottomSheet';
import { t, Keys } from '@/config/i18n';
import styles from './ShoppingItem.module.scss';
import { ShoppingItemWithCreator, SourceListInfo } from '@/types/shopping';

interface ShoppingItemProps {
  item: ShoppingItemWithCreator;
  onDelete: (itemId: string) => void;
  onUpdate: (
    itemId: string,
    updatedItem: Partial<ShoppingItemWithCreator>
  ) => void;
  onToggle: (itemId: string, checked: boolean) => void;
  sourceList?: SourceListInfo;
  sortable?: boolean;
}

export default function ShoppingItem({
  item,
  onDelete,
  onUpdate,
  onToggle,
  sourceList,
  sortable = false,
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
  } = useSortable({ id: item.id, disabled: !sortable || item.checked });

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

  const emoji = item.product?.emoji || item.emoji || '✨';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={clsx(
          styles.item,
          item.checked && styles.completed,
          sortable && styles.sortable,
          isDragging && styles.dragging
        )}
        role="listitem"
      >
        <button
          type="button"
          className={clsx(
            styles.dragHandle,
            (!sortable || item.checked) && styles.dragHandleHidden
          )}
          aria-label={`Przeciągnij, aby zmienić kolejność: ${item.name}`}
          aria-hidden={!sortable || item.checked}
          {...(sortable && !item.checked ? attributes : {})}
          {...(sortable && !item.checked ? listeners : {})}
        >
          <span className={styles.dragIcon} aria-hidden="true">
            ⋮⋮
          </span>
        </button>

        <CircularCheckbox
          checked={item.checked}
          onChange={() => handleToggleCheck()}
          size="md"
          className={styles.checkbox}
          aria-label={`Oznacz "${item.name}" jako ${
            item.checked ? 'niekupiony' : 'kupiony'
          }`}
        />

        <div className={styles.emoji}>{emoji}</div>

        <div
          className={styles.content}
          role="button"
          tabIndex={0}
          onClick={() => setShowEditSheet(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowEditSheet(true);
            }
          }}
          aria-label={`Edytuj ${item.name}`}
        >
          <div className={styles.name}>{item.name}</div>
          <Meta
            quantity={item.quantity}
            unit={item.unit}
            checked={item.checked}
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
                label: t(Keys.COMMON.DELETE),
                onClick: handleDeleteClick,
                variant: 'danger',
                icon: <span>🗑️</span>,
              },
            ]}
          />
        </div>
      </div>

      {showDeleteConfirm && (
        <AlertModal
          isOpen={true}
          title="Usuń produkt"
          message={`Czy na pewno chcesz usunąć „${item.name}”?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Usuń"
          cancelText="Anuluj"
          variant="danger"
        />
      )}

      <ItemBottomSheet
        item={item}
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        onSave={handleUpdate}
      />
    </>
  );
}
