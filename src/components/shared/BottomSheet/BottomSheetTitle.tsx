'use client';

import type { BottomSheetBaseProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetTitle({ children, className = '' }: BottomSheetBaseProps) {
  return <h2 className={`${styles.title} ${className}`}>{children}</h2>;
}
