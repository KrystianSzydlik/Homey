'use client';

import type { ModalFooterProps } from './types';
import styles from './Modal.module.scss';

export function ModalFooter({ className, children, ...props }: ModalFooterProps) {
  return (
    <div className={`${styles.footer} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}
