'use client';

import type { BottomSheetButtonProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetConfirmButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: BottomSheetButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.confirmButton} ${className}`}
    >
      {children}
    </button>
  );
}
