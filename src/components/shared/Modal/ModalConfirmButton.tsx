'use client';

import { motion } from 'framer-motion';
import type { ModalConfirmButtonProps } from './types';
import styles from './Modal.module.scss';

export function ModalConfirmButton({
  variant = 'default',
  isLoading = false,
  className,
  children,
  disabled,
  onClick,
  type,
}: ModalConfirmButtonProps) {
  return (
    <motion.button
      type={type || 'button'}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${styles.confirmButton} ${styles[variant]} ${className || ''}`}
      whileHover={{ y: isLoading ? 0 : -2 }}
      whileTap={{ y: isLoading ? 0 : 0 }}
    >
      {isLoading ? (
        <>
          <span className={styles.spinner} data-testid="modal-spinner" />
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
