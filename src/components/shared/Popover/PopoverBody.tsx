'use client';

import type { PopoverBodyProps } from './types';
import styles from './Popover.module.scss';

export function PopoverBody({
  className,
  children,
  ...props
}: PopoverBodyProps) {
  return (
    <div className={`${styles.body} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}
