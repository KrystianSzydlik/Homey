'use client';

import { useModalContext } from './ModalContext';
import type { ModalCancelButtonProps } from './types';
import styles from './Modal.module.scss';

export function ModalCancelButton({
  className,
  children,
  onClick,
  ...props
}: ModalCancelButtonProps) {
  const { onClose } = useModalContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onClose();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.cancelButton} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
