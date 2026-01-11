'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { updateShoppingItem } from '@/app/lib/shopping-actions';
import { ShoppingItemWithCreator } from '@/types/shopping';
import styles from './InlineNameEdit.module.scss';

interface InlineNameEditProps {
  itemId: string;
  initialName: string;
  onUpdate: (item: ShoppingItemWithCreator) => void;
  isCompleted?: boolean;
}

export default function InlineNameEdit({
  itemId,
  initialName,
  onUpdate,
  isCompleted = false,
}: InlineNameEditProps) {
  const [inputValue, setInputValue] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setInputValue(initialName);
  }, [initialName]);

  const handleSave = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed === initialName) {
      setInputValue(initialName);
      return;
    }

    startTransition(async () => {
      const result = await updateShoppingItem(itemId, {
        name: trimmed,
      });

      if (result.success && result.item) {
        onUpdate(result.item);
      } else {
        setInputValue(initialName);
      }
    });
  }, [inputValue, itemId, onUpdate, initialName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        setInputValue(initialName);
        e.currentTarget.blur();
      }
    },
    [initialName]
  );

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        disabled={isPending}
        className={`${styles.input} ${isCompleted ? styles.completed : ''}`}
        placeholder="Product name"
      />
      {isPending && <div className={styles.spinner} />}
    </div>
  );
}
