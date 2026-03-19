import clsx from 'clsx';
import styles from './ProgressBar.module.scss';

type ProgressSize = 'xs' | 'sm';
type ProgressColor = 'success' | 'rose';

interface ProgressBarProps {
  value: number;
  size?: ProgressSize;
  color?: ProgressColor;
  'aria-label': string;
  className?: string;
}

export default function ProgressBar({
  value,
  size = 'xs',
  color = 'rose',
  'aria-label': ariaLabel,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={clsx(styles.track, styles[size], className)}
    >
      <div
        className={clsx(styles.fill, styles[color])}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
