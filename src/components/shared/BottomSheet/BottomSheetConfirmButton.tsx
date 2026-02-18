'use client';

import type { BottomSheetButtonProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetConfirmButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  form,
}: BottomSheetButtonProps) {
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.confirmButton} ${className}`}
    >
      {children}
    </button>
  );
}
