import clsx from 'clsx';
import styles from './Pill.module.scss';

interface PillProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function Pill({
  children,
  isActive = false,
  onClick,
  icon,
  className,
}: PillProps) {
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      className={clsx(styles.pill, isActive && styles.active, className)}
      onClick={onClick}
      {...(onClick ? { type: 'button' as const } : {})}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
    </Tag>
  );
}
