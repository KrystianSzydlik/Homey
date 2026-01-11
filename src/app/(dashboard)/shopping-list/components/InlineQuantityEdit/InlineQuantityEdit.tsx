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
  const [inputValue, setInputValue] = useState(
    initialUnit ? `${initialQuantity} ${initialUnit}` : initialQuantity
  );
  const [isPending, startTransition] = useTransition();

  const handleSave = useCallback(async () => {
    const { quantity, unit } = parseQuantity(inputValue);
    if (quantity === initialQuantity && unit === initialUnit) return;

    startTransition(async () => {
      const result = await updateShoppingItem(itemId, {
        quantity,
        unit: unit ?? undefined,
      });

      if (result.success && result.item) {
        onUpdate(result.item);
      }
    });
  }, [inputValue, itemId, onUpdate, initialQuantity, initialUnit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        setInputValue(
          initialUnit ? `${initialQuantity} ${initialUnit}` : initialQuantity
        );
        e.currentTarget.blur();
      }
    },
    [initialQuantity, initialUnit]
  );

  return (
    <div className={styles.editContainer}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        disabled={isPending}
        className={styles.input}
        placeholder="1"
      />
      {isPending && <div className={styles.spinner} />}
    </div>
  );
}
