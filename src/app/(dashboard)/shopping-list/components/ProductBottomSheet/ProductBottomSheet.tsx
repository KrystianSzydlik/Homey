'use client';

import { useState, useEffect } from 'react';
import { ShoppingCategory, Product } from '@prisma/client';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { createProduct, updateProduct } from '@/app/lib/product-actions';
import { getSmartProductDefaults } from '@/app/lib/product-utils';
import { ProductCallbackData } from '@/types/shopping';
import { CATEGORIES } from '@/config/shopping';
import { UNITS } from '@/lib/constants/shopping-units';
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
      const {
        id,
        name: productName,
        emoji: productEmoji,
        defaultCategory,
        defaultUnit,
      } = result.product;
      onProductCreated({
        id,
        name: productName,
        emoji: productEmoji,
        defaultCategory,
        defaultUnit,
      });
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
          const {
            id,
            name: productName,
            emoji: productEmoji,
            defaultCategory,
            defaultUnit,
          } = result.product;
          onProductCreated({
            id,
            name: productName,
            emoji: productEmoji,
            defaultCategory,
            defaultUnit,
          });
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
          const {
            id,
            name: productName,
            emoji: productEmoji,
            defaultCategory,
            defaultUnit,
          } = result.product;
          onProductCreated({
            id,
            name: productName,
            emoji: productEmoji,
            defaultCategory,
            defaultUnit,
          });
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
      <BottomSheet isOpen={isOpen} onClose={onClose} closeOnSwipeDown>
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
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Basic Info Section */}
              <section className={styles.section}>
                <label className={styles.sectionLabel}>
                  Podstawowe informacje
                </label>

                <div className={styles.nameRow}>
                  <div className={styles.emojiPreview}>{emoji}</div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nazwa produktu"
                    className={styles.nameInput}
                    required
                    autoFocus
                  />
                </div>
              </section>

              {/* Emoji Section */}
              <section className={styles.section}>
                <label className={styles.sectionLabel}>Wybierz ikonę</label>
                <div className={styles.emojiGrid}>
                  {FOOD_EMOJIS.map((group) =>
                    group.emojis.map((e, idx) => (
                      <button
                        key={`${group.category}-${e}-${idx}`}
                        type="button"
                        className={`${styles.emojiButton} ${emoji === e ? styles.selected : ''}`}
                        onClick={() => setEmoji(e)}
                        title={group.category}
                      >
                        {e}
                      </button>
                    ))
                  )}
                </div>
              </section>

              {/* Details Section */}
              <section className={styles.section}>
                <label className={styles.sectionLabel}>Szczegóły</label>

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
                    groups={[
                      {
                        label: 'Waga',
                        options: UNITS.filter(
                          (u) => u.category === 'weight'
                        ).map((u) => ({
                          value: u.id,
                          label: `${u.short} (${u.full.one})`,
                        })),
                      },
                      {
                        label: 'Objętość',
                        options: UNITS.filter(
                          (u) => u.category === 'volume'
                        ).map((u) => ({
                          value: u.id,
                          label: `${u.short} (${u.full.one})`,
                        })),
                      },
                      {
                        label: 'Ilość',
                        options: UNITS.filter(
                          (u) => u.category === 'count'
                        ).map((u) => ({
                          value: u.id,
                          label: `${u.short} (${u.full.one})`,
                        })),
                      },
                      {
                        label: 'Pojemniki',
                        options: UNITS.filter(
                          (u) => u.category === 'container'
                        ).map((u) => ({
                          value: u.id,
                          label: `${u.short} (${u.full.one})`,
                        })),
                      },
                    ]}
                    placeholder="Wybierz jednostkę..."
                  />
                </div>
              </section>

              {error && <div className={styles.error}>{error}</div>}
            </form>
          </BottomSheet.Body>

          <BottomSheet.Footer>
            <BottomSheet.CancelButton disabled={isLoading}>
              Anuluj
            </BottomSheet.CancelButton>
            <BottomSheet.ConfirmButton
              onClick={() => handleSubmit({} as React.FormEvent)}
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
