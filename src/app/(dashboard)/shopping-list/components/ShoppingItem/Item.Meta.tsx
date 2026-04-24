import { UNITS } from '@/lib/constants/shopping-units';
import { formatPlnPrice } from '@/lib/pln-validation';
import styles from './ShoppingItem.module.scss';

interface MetaProps {
  quantity: string;
  unit: string | null;
  checked: boolean;
  purchasePrice?: number | null;
}

export const Meta = ({ quantity, unit, checked, purchasePrice }: MetaProps) => {
  const unitObj = UNITS.find((u) => u.id === unit);
  const unitShort = unitObj?.short || unit || '';

  const quantityNum = parseFloat(quantity);
  const totalPrice =
    purchasePrice != null && !isNaN(quantityNum) && quantityNum > 0
      ? purchasePrice * quantityNum
      : null;

  return (
    <div className={styles.meta}>
      <span className={styles.quantity}>{quantity}</span>
      {unitShort && <span className={styles.unit}> · {unitShort}</span>}
      {checked && (
        <>
          {' '}
          ·{' '}
          {totalPrice != null ? (
            <span className={styles.purchasePrice}>
              {formatPlnPrice(totalPrice)}
            </span>
          ) : (
            <span className={styles.addPriceHint}>Dodaj cenę</span>
          )}
        </>
      )}
    </div>
  );
};
