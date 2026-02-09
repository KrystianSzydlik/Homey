'use client';

import type { BottomSheetBaseProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetBody({ children, className = '' }: BottomSheetBaseProps) {
  return <div className={`${styles.body} ${className}`}>{children}</div>;
}
