'use client';

import { usePopoverContext } from './PopoverContext';
import type { PopoverCloseButtonProps } from './types';
import styles from './Popover.module.scss';

export function PopoverCloseButton({
  className,
  'aria-label': ariaLabel = 'Close',
  ...props
}: PopoverCloseButtonProps) {
  const { setIsOpen } = usePopoverContext();

  return (
    <button
      type="button"
      onClick={() => setIsOpen(false)}
      className={`${styles.closeButton} ${className || ''}`}
      aria-label={ariaLabel}
      {...props}
    >
      <svg
        width="16"
        height="16"
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
