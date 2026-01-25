'use client';

import { useModalContext } from './ModalContext';
import type { ModalCloseButtonProps } from './types';
import styles from './Modal.module.scss';

export function ModalCloseButton({
  className,
  'aria-label': ariaLabel = 'Close modal',
  ...props
}: ModalCloseButtonProps) {
  const { onClose } = useModalContext();

  return (
    <button
      type="button"
      onClick={onClose}
      className={`${styles.closeButton} ${className || ''}`}
      aria-label={ariaLabel}
      {...props}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
