'use client';

import type { PopoverHeaderProps } from './types';
import styles from './Popover.module.scss';

export function PopoverHeader({
  className,
  children,
  ...props
}: PopoverHeaderProps) {
  return (
    <div className={`${styles.header} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}
