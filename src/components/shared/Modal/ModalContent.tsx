'use client';

import { motion } from 'framer-motion';
import { useModalContext } from './ModalContext';
import type { ModalContentProps } from './types';
import styles from './Modal.module.scss';

const contentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
};

export function ModalContent({
  size = 'md',
  className,
  children,
}: ModalContentProps) {
  const { titleId, descriptionId, contentRef } = useModalContext();

  return (
    <motion.div
      ref={contentRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={contentVariants}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }}
      className={`${styles.content} ${styles[size]} ${className || ''}`}
    >
      {children}
    </motion.div>
  );
}
