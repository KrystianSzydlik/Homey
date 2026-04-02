import styles from './CategoryHeader.module.scss';

interface CategoryHeaderProps {
  emoji: string;
  label: string;
  count: number;
  id?: string;
}

export default function CategoryHeader({ emoji, label, count, id }: CategoryHeaderProps) {
  return (
    <div className={styles.header} id={id} role="heading" aria-level={3}>
      <span className={styles.emoji} aria-hidden="true">
        {emoji}
      </span>
      <span className={styles.label}>{label}</span>
      <span className={styles.line} aria-hidden="true" />
      <span className={styles.count}>{count}</span>
    </div>
  );
}
