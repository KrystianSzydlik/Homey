'use client';

import { useState, useEffect, useId } from 'react';
import { ShoppingCategory, Product } from '@prisma/client';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { createProduct, updateProduct } from '@/app/lib/product-actions';
import { getSmartProductDefaults } from '@/app/lib/product-utils';
import { extractProductCallback } from '@/app/lib/utils/product-callback';
import { getUnitGroups } from '@/lib/constants/shopping-units';
import { ProductCallbackData } from '@/types/shopping';
import { CATEGORIES } from '@/config/shopping';
import { FOOD_EMOJIS } from '@/config/emojis';
import { Dropdown } from '@/components/shared/Dropdown';
import { AlertModal } from '@/components/shared/Modal';
import styles from './ProductBottomSheet.module.scss';

interface ProductBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  initialName?: string;
  initialCategory?: ShoppingCategory;
  initialEmoji?: string;
  initialUnit?: string;
  onProductCreated: (product: ProductCallbackData) => void;
}

export default function ProductBottomSheet({
  isOpen,
  onClose,
  productId,
  initialName = '',
  initialCategory,
  initialEmoji,
  initialUnit = '',
  onProductCreated,
}: ProductBottomSheetProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<ShoppingCategory>(
    initialCategory || 'OTHER'
  );
  const [emoji, setEmoji] = useState(initialEmoji || '🛒');
  const [unit, setUnit] = useState(initialUnit);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [duplicateProduct, setDuplicateProduct] = useState<Product | null>(
    null
  );
  const errorId = useId();
  const nameInputId = useId();

  useEffect(() => {
    if (isOpen) {
      setName(initialName);

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
    }
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
    if (!duplicateProduct) return;

    setIsLoading(true);
    setError(null);

    const result = await updateProduct(duplicateProduct.id, {
      name: name.trim(),
      defaultCategory: category,
      emoji: emoji || undefined,
      defaultUnit: unit.trim() || undefined,
    });

    if (result.success && result.product) {
      onProductCreated(extractProductCallback(result.product));
      onClose();
    } else {
      setError(result.error || 'Failed to update product');
    }

    setIsLoading(false);
    setDuplicateProduct(null);
    setShowConfirmation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (productId) {
        const result = await updateProduct(productId, {
          name: name.trim(),
          defaultCategory: category,
          emoji: emoji || undefined,
          defaultUnit: unit.trim() || undefined,
        });

        if (result.success && result.product) {
          onProductCreated(extractProductCallback(result.product));
          onClose();
        } else {
          setError(result.error || 'Failed to save product');
        }
      } else {
        const result = await createProduct({
          name: name.trim(),
          defaultCategory: category,
          emoji: emoji || undefined,
          defaultUnit: unit.trim() || undefined,
        });

        if (result.success && result.product) {
          onProductCreated(extractProductCallback(result.product));
          onClose();
        } else if (result.existingProduct) {
          setDuplicateProduct(result.existingProduct);
          setShowConfirmation(true);
        } else {
          setError(result.error || 'Failed to create product');
        }
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        closeOnSwipeDown={false}
      >
        <BottomSheet.Overlay />
        <BottomSheet.Content size="md">
          <BottomSheet.Handle />

          <BottomSheet.Header>
            <BottomSheet.Title>
              {productId ? 'Edytuj produkt' : 'Dodaj produkt'}
            </BottomSheet.Title>
            <BottomSheet.CloseButton />
          </BottomSheet.Header>

          <BottomSheet.Body>
            <form
              id="product-bottom-sheet-form"
              onSubmit={handleSubmit}
              className={styles.form}
            >
              {/* Basic Info Section */}
              <section className={styles.section} aria-labelledby="basic-info-label">
                <h3 id="basic-info-label" className={styles.sectionLabel}>
                  Podstawowe informacje
                </h3>

                <div className={styles.nameRow}>
                  <div className={styles.emojiPreview}>{emoji}</div>
                  <input
                    id={nameInputId}
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nazwa produktu"
                    className={styles.nameInput}
                    required
                    autoFocus
                    aria-invalid={!name.trim() && name !== initialName}
                    aria-describedby={error ? errorId : undefined}
                  />
                </div>
              </section>

              {/* Emoji Section */}
              <section className={styles.section} aria-labelledby="emoji-label">
                <h3 id="emoji-label" className={styles.sectionLabel}>Wybierz ikonę</h3>
                <div className={styles.emojiGrid}>
                  {FOOD_EMOJIS.map((group) =>
                    group.emojis.map((e, idx) => (
                      <button
                        key={`${group.category}-${e}-${idx}`}
                        type="button"
                        className={`${styles.emojiButton} ${emoji === e ? styles.selected : ''}`}
                        onClick={() => setEmoji(e)}
                        aria-label={`${group.category} emoji: ${e}`}
                        aria-pressed={emoji === e}
                        title={group.category}
                      >
                        {e}
                      </button>
                    ))
                  )}
                </div>
              </section>

              {/* Details Section */}
              <section className={styles.section} aria-labelledby="details-label">
                <h3 id="details-label" className={styles.sectionLabel}>Szczegóły</h3>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Kategoria</label>
                  <Dropdown
                    value={category}
                    onChange={(value) => setCategory(value as ShoppingCategory)}
                    options={CATEGORIES.filter((c) => c.value !== 'ALL').map(
                      (c) => ({
                        value: c.value,
                        label: c.label,
                        icon: <span>{c.emoji}</span>,
                      })
                    )}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    Jednostka (opcjonalnie)
                  </label>
                  <Dropdown
                    value={unit}
                    onChange={(value) => setUnit(value)}
                    groups={getUnitGroups('detailed')}
                    placeholder="Wybierz jednostkę..."
                  />
                </div>
              </section>

              {error && (
                <div id={errorId} className={styles.error} role="alert">
                  {error}
                </div>
              )}
            </form>
          </BottomSheet.Body>

          <BottomSheet.Footer>
            <BottomSheet.CancelButton disabled={isLoading}>
              Anuluj
            </BottomSheet.CancelButton>
            <BottomSheet.ConfirmButton
              type="submit"
              form="product-bottom-sheet-form"
              disabled={isLoading}
            >
              {isLoading ? 'Zapisywanie...' : productId ? 'Zapisz' : 'Dodaj'}
            </BottomSheet.ConfirmButton>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet>

      {showConfirmation && (
        <AlertModal
          title="Produkt już istnieje"
          message={`Produkt "${duplicateProduct?.name}" już istnieje. Zaktualizować go?`}
          onConfirm={handleConfirmUpdate}
          onCancel={() => setShowConfirmation(false)}
          confirmText="Tak, zaktualizuj"
          cancelText="Nie"
          isOpen={showConfirmation}
          variant="warning"
          isLoading={isLoading}
        />
      )}
    </>
  );
}
