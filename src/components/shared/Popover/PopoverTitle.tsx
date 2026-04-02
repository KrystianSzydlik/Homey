'use client';

import type { PopoverTitleProps } from './types';
import styles from './Popover.module.scss';

export function PopoverTitle({
  className,
  children,
  ...props
}: PopoverTitleProps) {
  return (
    <h3 className={`${styles.title} ${className || ''}`} {...props}>
      {children}
    </h3>
  );
}
