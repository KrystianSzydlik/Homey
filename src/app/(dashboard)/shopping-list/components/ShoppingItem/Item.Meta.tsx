import { UNITS } from '@/lib/constants/shopping-units';
import { formatPlnPrice } from '@/lib/pln-validation';
import styles from './ShoppingItem.module.scss';
import React from 'react';

interface MetaProps {
  quantity: string;
  unit: string | null;
  price: number | null;
  checked: boolean;
}

export const Meta = ({
  quantity,
  unit,
  price,
  checked,
}: MetaProps) => {
  const unitObj = UNITS.find((u) => u.id === unit);
  const unitShort = unitObj?.short || unit || '';

  let priceDisplay: React.ReactNode = null;

  if (price !== null && price !== undefined) {
    const priceFormatted = formatPlnPrice(price);

    if (checked) {
      priceDisplay = priceFormatted;
    } else {
      priceDisplay = `~${priceFormatted}`;
    }
  } else if (checked) {
    priceDisplay = <span className={styles.addPriceHint}>Dodaj cenę</span>;
  }

  return (
    <div className={styles.meta}>
      <span className={styles.quantity}>{quantity}</span>
      {unitShort && <span className={styles.unit}> · {unitShort}</span>}
      {priceDisplay && (
        <>
          {' '}
          · <span className={styles.price}>{priceDisplay}</span>
        </>
      )}
    </div>
  );
};
