'use client';

import { useState, useEffect } from 'react';
import { ShoppingCategory, Product } from '@prisma/client';
import { Modal } from '@/components/shared/Modal';
import { createProduct, updateProduct } from '@/app/lib/product-actions';
import { getSmartProductDefaults } from '@/app/lib/product-utils';
import { ProductCallbackData } from '@/types/shopping';
import EmojiPicker from '../EmojiPicker/EmojiPicker';
import { Dropdown } from '@/components/shared/Dropdown';
import { CATEGORIES } from '@/config/shopping';
import { UNITS } from '@/lib/constants/shopping-units';
import styles from './CreateProductModal.module.scss';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  initialName?: string;
  initialCategory?: ShoppingCategory;
  initialEmoji?: string;
  initialUnit?: string;
  onProductCreated: (product: ProductCallbackData) => void;
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <Modal.Overlay />
        <Modal.Content size="md">
          <Modal.Header>
            <Modal.Title>
              {productId ? 'Edytuj produkt' : 'Dodaj nowy produkt'}
            </Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>

          <Modal.Body>
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
                <label>Jednostka (opcjonalnie)</label>
                <Dropdown
                  value={unit}
                  onChange={(value) => setUnit(value)}
                  groups={[
                    {
                      label: 'Waga',
                      options: UNITS.filter((u) => u.category === 'weight').map(
                        (u) => ({
                          value: u.id,
                          label: `${u.short} (${u.full.one})`,
                        })
                      ),
                    },
                    {
                      label: 'Objętość',
                      options: UNITS.filter((u) => u.category === 'volume').map(
                        (u) => ({
                          value: u.id,
                          label: `${u.short} (${u.full.one})`,
                        })
                      ),
                    },
                    {
                      label: 'Ilość',
                      options: UNITS.filter((u) => u.category === 'count').map(
                        (u) => ({
                          value: u.id,
                          label: `${u.short} (${u.full.one})`,
                        })
                      ),
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

              {error && <div className={styles.error}>{error}</div>}
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Modal.CancelButton disabled={isLoading}>Anuluj</Modal.CancelButton>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading
                ? 'Zapisywanie...'
                : productId
                  ? 'Zapisz zmiany'
                  : 'Zapisz produkt'}
            </button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {showConfirmation && (
        <ConfirmModal
          title="Produkt już istnieje"
          message={`Produkt o nazwie "${
            duplicateProduct?.name
          }" już istnieje. Czy chcesz go zaktualizować danymi, które wprowadziłeś?`}
          onConfirm={handleConfirmUpdate}
          onCancel={() => setShowConfirmation(false)}
          confirmText="Tak, zaktualizuj"
          cancelText="Nie, anuluj"
          isOpen={showConfirmation}
          variant="warning"
          isLoading={isLoading}
        />
      )}
    </>
  );
}
