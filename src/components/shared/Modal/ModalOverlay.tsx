'use client';

import { motion } from 'framer-motion';
import { useModalContext } from './ModalContext';
import type { ModalOverlayProps } from './types';
import styles from './Modal.module.scss';

export function ModalOverlay({ className }: ModalOverlayProps) {
  const { onClose, closeOnOverlayClick } = useModalContext();

  const handleClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`${styles.overlay} ${className || ''}`}
      aria-hidden="true"
    />
  );
}
