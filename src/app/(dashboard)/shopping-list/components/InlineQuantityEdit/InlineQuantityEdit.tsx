'use client';

import { useState, useRef, useCallback, useTransition } from 'react';
import { updateShoppingItem } from '@/src/app/lib/shopping-actions';
import { ShoppingItemWithCreator } from '@/src/types/shopping';
import styles from './InlineQuantityEdit.module.scss';

interface InlineQuantityEditProps {
  itemId: string;
  initialQuantity: string;
  initialUnit: string | null;
  onUpdate: (item: ShoppingItemWithCreator) => void;
}

const parseQuantity = (
  input: string
): { quantity: string; unit: string | null } => {
  const trimmed = input.trim();
  if (!trimmed) return { quantity: '1', unit: null };

  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);

  if (match) {
    const quantity = match[1].replace(',', '.');
    const unit = match[2].trim() || null;
    return { quantity, unit };
  }

  return { quantity: trimmed, unit: null };
};

export default function InlineQuantityEdit({
  itemId,
  initialQuantity,
  initialUnit,
  onUpdate,
}: InlineQuantityEditProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [unit, setUnit] = useState(initialUnit || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = useCallback(async () => {
    if (quantity === initialQuantity && (unit || null) === initialUnit) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const result = await updateShoppingItem(itemId, {
        quantity,
        unit: unit.trim() || undefined,
      });

      if (result.success && result.item) {
        onUpdate(result.item);
        setIsEditing(false);
      }
    });
  }, [quantity, unit, itemId, onUpdate, initialQuantity, initialUnit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        setQuantity(initialQuantity);
        setUnit(initialUnit || '');
        setIsEditing(false);
        e.currentTarget.blur();
      }
    },
    [initialQuantity, initialUnit]
  );

  return (
    <div className={styles.editContainer}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onFocus={(e) => {
            setIsEditing(true);
            e.currentTarget.select();
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isPending}
          className={styles.quantityInput}
          placeholder="1"
        />
        {(unit || isEditing) && (
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onFocus={(e) => {
              setIsEditing(true);
              e.currentTarget.select();
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            disabled={isPending}
            className={styles.unitInput}
            placeholder="j.m."
          />
        )}
      </div>
      {isPending && <div className={styles.spinner} />}
    </div>
  );
}
