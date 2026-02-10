'use client';

import { useState, useEffect } from 'react';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { ShoppingItemWithCreator } from '@/types/shopping';
import { Dropdown } from '@/components/shared/Dropdown';
import { getUnitGroups } from '@/lib/constants/shopping-units';
import { updateShoppingItem } from '@/lib/actions/shopping/update-item';
import styles from './ItemBottomSheet.module.scss';

interface ItemBottomSheetProps {
  item: ShoppingItemWithCreator;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: Partial<ShoppingItemWithCreator>) => void;
}

export default function ItemBottomSheet({
  item,
  isOpen,
  onClose,
  onSave,
}: ItemBottomSheetProps) {
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
        });
        onClose();
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
    <BottomSheet isOpen={isOpen} onClose={onClose} closeOnSwipeDown>
      <BottomSheet.Overlay />
      <BottomSheet.Content size="full">
        <BottomSheet.Handle />

        <BottomSheet.Header>
          <BottomSheet.Title>
            <span className={styles.titleEmoji}>{item.emoji}</span>
            {item.name}
          </BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        <BottomSheet.Body>
          <form className={styles.form}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Ilość</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Jednostka</label>
                <Dropdown
                  value={unit}
                  onChange={(value) => setUnit(value)}
                  groups={getUnitGroups()}
                  placeholder="Wybierz..."
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Cena (PLN)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className={styles.input}
                />
              </div>
            </div>

            <p className={styles.helperText}>{helperText}</p>

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
          </form>
        </BottomSheet.Body>

        <BottomSheet.Footer>
          <BottomSheet.CancelButton disabled={isLoading}>
            Anuluj
          </BottomSheet.CancelButton>
          <BottomSheet.ConfirmButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Zapisywanie...' : 'Zapisz'}
          </BottomSheet.ConfirmButton>
        </BottomSheet.Footer>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
