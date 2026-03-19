import clsx from 'clsx';
import styles from './Skeleton.module.scss';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

function SkeletonLine({
  variant = 'text',
  width,
  height,
  className,
}: Omit<SkeletonProps, 'count'>) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={clsx(styles.skeleton, styles[variant], className)}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
}

export default function Skeleton({
  count = 1,
  ...rest
}: SkeletonProps) {
  if (count === 1) {
    return <SkeletonLine {...rest} />;
  }

  return (
    <div className={styles.group} aria-hidden="true" role="presentation">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonLine key={i} {...rest} />
      ))}
    </div>
  );
}
