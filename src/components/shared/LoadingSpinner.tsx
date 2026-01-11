import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function LoadingSpinner({ size = 'medium', className }: LoadingSpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]} ${className || ''}`}
      role="status"
      aria-label="Loading"
    />
  );
}
