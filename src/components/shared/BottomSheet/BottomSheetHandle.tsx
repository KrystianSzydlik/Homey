'use client';

import styles from './BottomSheet.module.scss';

export function BottomSheetHandle() {
  return (
    <div className={styles.handleContainer}>
      <div className={styles.handle} aria-hidden="true" />
    </div>
  );
}
