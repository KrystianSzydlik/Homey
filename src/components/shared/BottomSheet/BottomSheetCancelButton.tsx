'use client';

import { useBottomSheetContext } from './BottomSheetContext';
import type { BottomSheetButtonProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetCancelButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: BottomSheetButtonProps) {
  const { onClose } = useBottomSheetContext();

  const handleClick = () => {
    onClick?.();
    onClose();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${styles.cancelButton} ${className}`}
    >
      {children}
    </button>
  );
}
