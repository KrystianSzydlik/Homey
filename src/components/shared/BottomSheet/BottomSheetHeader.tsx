'use client';

import type { BottomSheetBaseProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetHeader({ children, className = '' }: BottomSheetBaseProps) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
}
