import { UNITS } from '@/lib/constants/shopping-units';
import styles from './ShoppingItem.module.scss';
import React from 'react';
import { Decimal } from '@prisma/client/runtime/library';

interface MetaProps {
  quantity: string;
  unit: string | null;
  price: Decimal | null;
  checked: boolean;
  currency?: string;
}

export const Meta = ({
  quantity,
  unit,
  price,
  checked,
  currency = 'PLN',
}: MetaProps) => {
  const unitObj = UNITS.find((u) => u.id === unit);
  const unitShort = unitObj?.short || unit || '';

  let priceDisplay: React.ReactNode = null;

  if (price !== null && price !== undefined) {
    const priceFormatted = price.toFixed(2);

    if (checked) {
      priceDisplay = `${priceFormatted} ${currency}`;
    } else {
      priceDisplay = `~${priceFormatted} ${currency}`;
    }
  } else if (checked) {
    // Placeholder for "Add price" - in the future this could be a button/link working with the parent
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
