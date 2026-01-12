'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@prisma/client';
import { ShoppingCategory } from '@prisma/client';
import { createProduct, updateProduct } from '@/app/lib/product-actions';
import { getSmartProductDefaults } from '@/app/lib/product-utils';
import EmojiPicker from '../EmojiPicker/EmojiPicker';
import CategoryPicker from '../CategoryPicker/CategoryPicker';
import styles from './CreateProductModal.module.scss';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  initialName?: string;
  initialCategory?: ShoppingCategory;
  initialEmoji?: string;
  initialUnit?: string;
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
  productId,
  initialName = '',
  initialCategory,
  initialEmoji,
  initialUnit = '',
  onProductCreated,
}: CreateProductModalProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<ShoppingCategory>(
    initialCategory || 'OTHER'
  );
  const [emoji, setEmoji] = useState(initialEmoji || '🛒');
  const [unit, setUnit] = useState(initialUnit);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingProductToUpdate, setExistingProductToUpdate] =
    useState<Product | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setName(initialName);
      setError(null);
      setExistingProductToUpdate(null);

      if (productId) {
        setCategory(initialCategory || 'OTHER');
        setEmoji(initialEmoji || '🛒');
        setUnit(initialUnit);
      } else {
        const defaults = getSmartProductDefaults(initialName);
        setCategory(defaults.category);
        setEmoji(defaults.emoji);
        setUnit('');
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [
    isOpen,
    initialName,
    productId,
    initialCategory,
    initialEmoji,
    initialUnit,
  ]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!productId) {
      const defaults = getSmartProductDefaults(newName);
      setCategory(defaults.category);
      setEmoji(defaults.emoji);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!existingProductToUpdate) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateProduct(existingProductToUpdate.id, {
        name: name.trim(),
        defaultCategory: category,
        emoji: emoji || undefined,
        defaultUnit: unit?.trim() || undefined,
      });

      if (result.success && result.product) {
        onProductCreated(result.product as any);
        onClose();
      } else {
        setError(result.error || 'Failed to update product');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
      setExistingProductToUpdate(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);
    setExistingProductToUpdate(null);

    const payload = {
      name: name.trim(),
      defaultCategory: category,
      emoji: emoji || undefined,
      defaultUnit: unit?.trim() || undefined,
    };

    try {
      const result = productId
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

      if (result.success && result.product) {
        onProductCreated(result.product as any);
        onClose();
      } else {
        if (!result.success && result.existingProduct) {
          setExistingProductToUpdate(result.existingProduct);
          setError(
            `Produkt "${result.existingProduct.name}" już istnieje. Czy chcesz go zaktualizować?`
          );
        } else {
          setError(result.error || 'Failed to save product');
        }
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
          <h2>{productId ? 'Edytuj produkt' : 'Dodaj nowy produkt'}</h2>
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
              disabled={!!existingProductToUpdate}
            />
          </div>

          <div className={styles.field}>
            <label>Ikona (Emoji)</label>
            <EmojiPicker
              currentEmoji={emoji}
              onSelect={setEmoji}
              disabled={!!existingProductToUpdate}
            />
          </div>

          <div className={styles.field}>
            <label>Kategoria</label>
            <CategoryPicker
              currentCategory={category}
              onSelect={setCategory}
              disabled={!!existingProductToUpdate}
            />
          </div>

          <div className={styles.field}>
            <label>Jednostka (opcjonalnie)</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="np. kg, szt"
              disabled={!!existingProductToUpdate}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {existingProductToUpdate ? (
            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => {
                  setExistingProductToUpdate(null);
                  setError(null);
                }}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdate}
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Aktualizowanie...' : 'Zaktualizuj'}
              </button>
            </div>
          ) : (
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
          )}
        </form>
      </div>
    </div>
  );
}
