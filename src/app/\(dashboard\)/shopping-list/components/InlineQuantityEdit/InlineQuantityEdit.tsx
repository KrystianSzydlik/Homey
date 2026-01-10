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

const parseQuantity = (input: string): { quantity: string; unit: string | null } => {
  const trimmed = input.trim();

  if (!trimmed) {
    return { quantity: '1', unit: null };
  }

  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);

  if (match) {
    const quantity = match[1].replace(',', '.');
    const unit = match[2].trim() || null;
    return { quantity, unit };
  }

  return { quantity: trimmed, unit: null };
};

const formatDisplay = (quantity: string, unit: string | null): string => {
  if (!unit) return quantity;
  return `${quantity} ${unit}`;
};

export default function InlineQuantityEdit({
  itemId,
  initialQuantity,
  initialUnit,
  onUpdate,
}: InlineQuantityEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(
    formatDisplay(initialQuantity, initialUnit)
  );
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    if (isPending) return;

    const { quantity, unit } = parseQuantity(inputValue);

    if (quantity === initialQuantity && unit === initialUnit) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const result = await updateShoppingItem(itemId, {
        quantity,
        unit,
      });

      if (result.success && result.item) {
        onUpdate(result.item);
        setIsEditing(false);
      } else {
        setInputValue(formatDisplay(initialQuantity, initialUnit));
        setIsEditing(false);
      }
    });
  }, [itemId, inputValue, initialQuantity, initialUnit, onUpdate, isPending]);

  const handleCancel = useCallback(() => {
    setInputValue(formatDisplay(initialQuantity, initialUnit));
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

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 150);
  }, [isEditing, handleSave]);

  if (isEditing) {
    return (
      <div className={styles.editContainer}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={styles.editInput}
          disabled={isPending}
          placeholder="e.g. 2kg, 3 szt"
        />
        {isPending && <span className={styles.miniSpinner} />}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={styles.displayButton}
      title="Click to edit quantity"
    >
      {formatDisplay(initialQuantity, initialUnit) || 'Add qty'}
    </button>
  );
}
