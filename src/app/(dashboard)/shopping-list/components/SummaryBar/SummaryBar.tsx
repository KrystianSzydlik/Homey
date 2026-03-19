import ProgressBar from '@/components/shared/ProgressBar';
import { pluralPl } from '@/config/i18n';
import styles from './SummaryBar.module.scss';

interface SummaryBarProps {
  totalItems: number;
  checkedItems: number;
}

export default function SummaryBar({ totalItems, checkedItems }: SummaryBarProps) {
  if (totalItems === 0) return null;

  const progress = Math.round((checkedItems / totalItems) * 100);

  return (
    <div className={styles.bar}>
      <div className={styles.text}>
        <span className={styles.total}>
          {totalItems} {pluralPl(totalItems, 'produkt', 'produkty', 'produktów')}
        </span>
        <span className={styles.separator} aria-hidden="true">
          ·
        </span>
        <span className={styles.checked}>
          {checkedItems} {pluralPl(checkedItems, 'kupiony', 'kupione', 'kupionych')}
        </span>
      </div>
      <ProgressBar
        value={progress}
        size="xs"
        color={progress === 100 ? 'success' : 'rose'}
        aria-label={`Postęp zakupów: ${progress}%`}
      />
    </div>
  );
}
