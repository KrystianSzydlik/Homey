'use client';

import type { ModalHeaderProps } from './types';
import styles from './Modal.module.scss';

export function ModalHeader({ className, children, ...props }: ModalHeaderProps) {
  return (
    <div className={`${styles.header} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}
