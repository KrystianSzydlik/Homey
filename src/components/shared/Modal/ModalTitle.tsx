'use client';

import { useModalContext } from './ModalContext';
import type { ModalTitleProps } from './types';
import styles from './Modal.module.scss';

export function ModalTitle({ className, children, ...props }: ModalTitleProps) {
  const { titleId } = useModalContext();

  return (
    <h2 id={titleId} className={`${styles.title} ${className || ''}`} {...props}>
      {children}
    </h2>
  );
}
