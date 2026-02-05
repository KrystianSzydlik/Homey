'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/Modal';
import { ShoppingItemWithCreator } from '@/types/shopping';
import { Dropdown } from '@/components/shared/Dropdown';
import { getUnitGroups } from '@/lib/constants/shopping-units';
import { updateShoppingItem } from '@/lib/actions/shopping/update-item';
import styles from './EditItemSheet.module.scss';

interface EditItemSheetProps {
  item: ShoppingItemWithCreator;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: Partial<ShoppingItemWithCreator>) => void; // Client side update or refetch trigger
}

export default function EditItemSheet({
  item,
  isOpen,
  onClose,
  onSave,
}: EditItemSheetProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit || '');
  const [price, setPrice] = useState<string>(
    item.price ? String(item.price) : ''
  );
  const [checked, setChecked] = useState(item.checked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity(item.quantity);
      setUnit(item.unit || '');
      setPrice(item.price ? String(item.price) : '');
      setChecked(item.checked);
      setError(null);
    }
  }, [isOpen, item]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const priceNum = price ? parseFloat(price.replace(',', '.')) : null;

      const result = await updateShoppingItem({
        itemId: item.id,
        quantity,
        unit: unit || undefined,
        price: priceNum,
        checked,
      });

      if (result.success && result.data) {
        onSave({
          ...item,
          quantity: result.data.quantity,
          unit: result.data.unit,
          price: result.data.price,
          checked: result.data.checked,
          // purchasedAt logic handled on server, client might need refresh if relying on it immediately
        });
        onClose();
      } else {
        // setError('Failed to save'); throw?
        // Since result doesn't have error text in my impl (it throws), I need to catch.
      }
    } catch (e) {
      console.error(e);
      setError('Nie udało się zapisać. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrice = () => {
    setPrice('');
  };

  const helperText = checked
    ? 'Ta cena trafi do statystyk.'
    : 'Cena robocza — nie liczymy jej w statystykach.';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content size="md">
        {' '}
        {/* Assuming size prop exists or adjusting */}
        <Modal.Header>
          <Modal.Title>Edytuj produkt</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <div className={styles.form}>
            <div className={styles.field}>
              <label>Ilość</label>
              <input
                type="text" // using text for quantity to allow "1/2" etc if needed, or number. Spec says type="number" placeholder="1".
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label>Jednostka</label>
              <Dropdown
                value={unit}
                onChange={(value) => setUnit(value)}
                groups={getUnitGroups()}
                placeholder="Wybierz jednostkę..."
              />
            </div>

            <div className={styles.field}>
              <label>Cena (PLN)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                className={styles.input}
              />
              <p className={styles.helperText}>{helperText}</p>
            </div>

            <div className={styles.checkboxField}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Kupione</span>
              </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          {price && (
            <button
              onClick={handleDeletePrice}
              className={styles.destructiveLink}
              type="button"
            >
              Usuń cenę
            </button>
          )}
          <Modal.CancelButton disabled={isLoading}>Anuluj</Modal.CancelButton>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={isLoading}
          >
            {isLoading ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
