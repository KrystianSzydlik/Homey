'use client';

import { useModalContext } from './ModalContext';
import type { ModalBodyProps } from './types';
import styles from './Modal.module.scss';

export function ModalBody({ className, children, ...props }: ModalBodyProps) {
  const { descriptionId } = useModalContext();

  return (
    <div
      id={descriptionId}
      className={`${styles.body} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
