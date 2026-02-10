'use client';

import { motion } from 'framer-motion';
import { useBottomSheetContext } from './BottomSheetContext';
import styles from './BottomSheet.module.scss';

export function BottomSheetOverlay() {
  const { closeOnOverlayClick, onClose } = useBottomSheetContext();

  return (
    <motion.div
      className={styles.overlay}
      onClick={closeOnOverlayClick ? onClose : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}
