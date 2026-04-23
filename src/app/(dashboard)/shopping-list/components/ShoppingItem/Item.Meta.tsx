import { UNITS } from '@/lib/constants/shopping-units';
import styles from './ShoppingItem.module.scss';

interface MetaProps {
  quantity: string;
  unit: string | null;
  checked: boolean;
}

export const Meta = ({ quantity, unit, checked }: MetaProps) => {
  const unitObj = UNITS.find((u) => u.id === unit);
  const unitShort = unitObj?.short || unit || '';

  return (
    <div className={styles.meta}>
      <span className={styles.quantity}>{quantity}</span>
      {unitShort && <span className={styles.unit}> · {unitShort}</span>}
      {checked && (
        <>
          {' '}
          · <span className={styles.addPriceHint}>Dodaj cenę</span>
        </>
      )}
    </div>
  );
};
