'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.wrapper}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className={styles.backdrop}
            aria-hidden="true"
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              x: '-50%',
              y: 'calc(-50% + 20px)',
            }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{
              opacity: 0,
              scale: 0.95,
              x: '-50%',
              y: 'calc(-50% + 20px)',
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
              duration: 0.3,
            }}
            className={styles.modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <h2 id="confirm-title" className={styles.title}>
              {title}
            </h2>

            <p id="confirm-message" className={styles.message}>
              {message}
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className={styles.cancelButton}
              >
                {cancelText}
              </button>
              <motion.button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`${styles.confirmButton} ${styles[variant]}`}
                whileHover={{ y: isLoading ? 0 : -2 }}
                whileTap={{ y: isLoading ? 0 : 0 }}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner} />
                    {confirmText}
                  </>
                ) : (
                  confirmText
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
