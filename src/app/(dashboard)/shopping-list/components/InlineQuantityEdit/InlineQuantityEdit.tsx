'use client';

import { useState, useRef, useCallback, useTransition } from 'react';
import { updateShoppingItem } from '../../../../lib/shopping-actions';
import { ShoppingItemWithCreator } from '../../../../../types/shopping';
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
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(
    initialUnit ? `${initialQuantity} ${initialUnit}` : initialQuantity
  );
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = initialUnit
    ? `${initialQuantity} ${initialUnit}`
    : initialQuantity;

  const handleSave = useCallback(async () => {
    const { quantity, unit } = parseQuantity(inputValue);

    startTransition(async () => {
      const result = await updateShoppingItem(itemId, {
        quantity,
        unit: unit ?? undefined,
      });

      if (result.success && result.item) {
        onUpdate(result.item);
        setIsEditing(false);
      }
    });
  }, [inputValue, itemId, onUpdate]);

  const handleCancel = useCallback(() => {
    setInputValue(
      initialUnit ? `${initialQuantity} ${initialUnit}` : initialQuantity
    );
    setIsEditing(false);
  }, [initialQuantity, initialUnit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  if (isEditing) {
    return (
      <div className={styles.editContainer}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          disabled={isPending}
          className={styles.editInput}
          placeholder="e.g., 2kg, 3 szt"
        />
        {isPending && <div className={styles.miniSpinner} />}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
      className={styles.displayButton}
      title="Click to edit quantity"
      type="button"
    >
      {displayValue}
    </button>
  );
}
