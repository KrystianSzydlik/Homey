'use client';

import { useState, useRef, useCallback, useTransition } from 'react';
import { updateShoppingItem } from '@/app/lib/shopping-actions';
import { ShoppingItemWithCreator } from '@/types/shopping';
import styles from './InlineQuantityEdit.module.scss';

interface InlineQuantityEditProps {
  itemId: string;
  initialQuantity: string;
  initialUnit: string | null;
  onUpdate: (item: ShoppingItemWithCreator) => void;
}

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
  const escapePressed = useRef(false);

  const handleSave = useCallback(async () => {
    if (escapePressed.current) {
      escapePressed.current = false;
      setQuantity(initialQuantity);
      setUnit(initialUnit || '');
      return;
    }
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
        setQuantity(result.item.quantity);
        setUnit(result.item.unit || '');
        setIsEditing(false);
      }
    });
  }, [quantity, unit, itemId, onUpdate, initialQuantity, initialUnit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        escapePressed.current = true;
        setQuantity(initialQuantity);
        setUnit(initialUnit || '');
        setIsEditing(false);
        e.currentTarget.blur();
      }
    },
    [initialQuantity, initialUnit]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent) => {
    if (
      containerRef.current &&
      containerRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    handleSave();
  };

  return (
    <div className={styles.editContainer} ref={containerRef}>
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
          onBlur={handleBlur}
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
            onBlur={handleBlur}
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
