'use client';

import type { BottomSheetBaseProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetFooter({ children, className = '' }: BottomSheetBaseProps) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
}
