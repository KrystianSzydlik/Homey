import ProgressBar from '@/components/shared/ProgressBar';
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
          {totalItems} {totalItems === 1 ? 'produkt' : 'produktów'}
        </span>
        <span className={styles.separator} aria-hidden="true">
          ·
        </span>
        <span className={styles.checked}>
          {checkedItems} {checkedItems === 1 ? 'kupiony' : 'kupionych'}
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
