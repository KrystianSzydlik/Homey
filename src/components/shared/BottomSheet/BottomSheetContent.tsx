'use client';

import { motion } from 'framer-motion';
import { useBottomSheetContext } from './BottomSheetContext';
import { useSwipeToDismiss } from './useSwipeToDismiss';
import type { BottomSheetContentProps } from './types';
import styles from './BottomSheet.module.scss';

export function BottomSheetContent({
  children,
  size = 'md',
  className = '',
}: BottomSheetContentProps) {
  const { contentRef, maxHeight, closeOnSwipeDown, onClose } = useBottomSheetContext();
  
  const { handleTouchStart, handleTouchMove, handleTouchEnd, dragY } = 
    useSwipeToDismiss(closeOnSwipeDown, onClose);

  return (
    <motion.div
      ref={contentRef}
      className={`${styles.content} ${styles[size]} ${className}`}
      style={{ 
        maxHeight,
        y: dragY,
      }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300,
      }}
      role="dialog"
      aria-modal="true"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </motion.div>
  );
}
