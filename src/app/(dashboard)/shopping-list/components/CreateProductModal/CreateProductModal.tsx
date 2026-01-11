'use client';

import { useState, useEffect } from 'react';
import { ShoppingCategory } from '@prisma/client';
import { CATEGORIES } from '@/config/shopping';
import { createProduct } from '@/app/lib/product-actions';
import { getSmartProductDefaults } from '@/app/lib/product-utils';
import EmojiPicker from '../EmojiPicker/EmojiPicker';
import CategoryPicker from '../CategoryPicker/CategoryPicker';
import styles from './CreateProductModal.module.scss';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  onProductCreated: (product: {
    id: string;
    name: string;
    emoji: string | null;
    defaultCategory: ShoppingCategory;
    defaultUnit: string | null;
  }) => void;
}

export default function CreateProductModal({
  isOpen,
  onClose,
  initialName = '',
  onProductCreated,
}: CreateProductModalProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<ShoppingCategory>('OTHER');
  const [emoji, setEmoji] = useState('🛒');
  const [unit, setUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      const defaults = getSmartProductDefaults(initialName);
      setCategory(defaults.category);
      setEmoji(defaults.emoji);
    }
  }, [isOpen, initialName]);

  // Handle name changes to update suggestions dynamically
  const handleNameChange = (newName: string) => {
    setName(newName);
    const defaults = getSmartProductDefaults(newName);
    setCategory(defaults.category);
    setEmoji(defaults.emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await createProduct({
        name: name.trim(),
        defaultCategory: category,
        emoji: emoji || undefined,
        defaultUnit: unit.trim() || undefined,
      });

      if (result.success && result.product) {
        onProductCreated(result.product as any);
        onClose();
      } else {
        setError(result.error || 'Failed to create product');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Dodaj nowy produkt</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Nazwa produktu</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="np. Pomidory malinowe"
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label>Ikona (Emoji)</label>
            <EmojiPicker currentEmoji={emoji} onSelect={setEmoji} />
          </div>

          <div className={styles.field}>
            <label>Kategoria</label>
            <CategoryPicker currentCategory={category} onSelect={setCategory} />
          </div>

          <div className={styles.field}>
            <label>Jednostka (opcjonalnie)</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="np. kg, szt"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Zapisywanie...' : 'Zapisz produkt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
