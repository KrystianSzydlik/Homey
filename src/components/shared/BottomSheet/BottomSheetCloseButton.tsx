'use client';

import { useBottomSheetContext } from './BottomSheetContext';
import type { BottomSheetButtonProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetCloseButton({
  onClick,
  className = '',
}: Omit<BottomSheetButtonProps, 'children'>) {
  const { onClose } = useBottomSheetContext();

  const handleClick = () => {
    onClick?.();
    onClose();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.closeButton} ${className}`}
      aria-label="Close"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="5" y1="5" x2="15" y2="15" />
        <line x1="15" y1="5" x2="5" y2="15" />
      </svg>
    </button>
  );
}
