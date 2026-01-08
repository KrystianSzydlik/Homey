'use client';

import { ShoppingCategory } from '@prisma/client';
import { useCallback, useRef, useState, useTransition } from 'react';
import { createShoppingItem } from '@/app/lib/shopping-actions';
import { ShoppingItemWithCreator } from '@/types/shopping';
import styles from './AddItemForm.module.scss';

interface AddItemFormProps {
  onAddItem: (item: ShoppingItemWithCreator) => void;
}

const CATEGORIES: { value: ShoppingCategory; label: string }[] = [
  { value: 'VEGETABLES', label: '🥬 Vegetables' },
  { value: 'DAIRY', label: '🥛 Dairy' },
  { value: 'MEAT', label: '🍖 Meat' },
  { value: 'BAKERY', label: '🍞 Bakery' },
  { value: 'FRUITS', label: '🍎 Fruits' },
  { value: 'FROZEN', label: '❄️ Frozen' },
  { value: 'DRINKS', label: '🥤 Drinks' },
  { value: 'CONDIMENTS', label: '🧂 Condiments' },
  { value: 'SWEETS', label: '🍫 Sweets' },
  { value: 'OTHER', label: '📦 Other' },
];

export default function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState<ShoppingCategory>('OTHER');
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        nameInputRef.current?.focus();
        return;
      }

      startTransition(async () => {
        const result = await createShoppingItem({
          name: name.trim(),
          quantity: quantity || '1',
          unit: unit || undefined,
          category,
        });

        if (result.success && result.item) {
          onAddItem(result.item);
          setName('');
          setQuantity('1');
          setUnit('');
          setCategory('OTHER');
          setShowForm(false);
        }
      });
    },
    [name, quantity, unit, category, onAddItem],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      } else if (e.key === 'Escape') {
        setShowForm(false);
      }
    },
    [handleSubmit],
  );

  return (
    <div className={styles.container}>
      {!showForm ? (
        <button
          className={styles.toggleButton}
          onClick={() => {
            setShowForm(true);
            setTimeout(() => nameInputRef.current?.focus(), 0);
          }}
          type="button"
        >
          + Add Item
        </button>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldRow}>
            <input
              ref={nameInputRef}
              type="text"
              placeholder="Item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.nameInput}
              disabled={isPending}
              autoFocus
            />
            <input
              type="text"
              placeholder="Qty"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.quantityInput}
              disabled={isPending}
            />
            <input
              type="text"
              placeholder="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.unitInput}
              disabled={isPending}
            />
          </div>

          <div className={styles.categoryRow}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
              className={styles.categorySelect}
              disabled={isPending}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isPending || !name.trim()}
            >
              {isPending ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setShowForm(false);
                setName('');
                setQuantity('1');
                setUnit('');
                setCategory('OTHER');
              }}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
