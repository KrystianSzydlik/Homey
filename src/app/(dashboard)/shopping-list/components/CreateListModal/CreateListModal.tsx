'use client';

import { useEffect, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createShoppingList } from '@/app/lib/shopping-list-actions';
import { ShoppingListWithCreator } from '@/types/shopping';
import styles from './CreateListModal.module.scss';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (list: ShoppingListWithCreator) => void;
}

const EMOJI_OPTIONS = [
  '🛒',
  '📝',
  '🍔',
  '🥗',
  '🥤',
  '🍕',
  '🥩',
  '🧀',
  '🏪',
  '🛍️',
];

const COLOR_PRESETS = [
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Blue', value: '#0ea5e9' },
  { label: 'Green', value: '#10b981' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Amber', value: '#f59e0b' },
];

export default function CreateListModal({
  isOpen,
  onClose,
  onListCreated,
}: CreateListModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🛒',
    color: '#8b5cf6',
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('List name is required');
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await createShoppingList({
        name: formData.name.trim(),
        emoji: formData.emoji,
        color: formData.color,
      });

      if (result.success && result.list) {
        onListCreated(result.list);
        setFormData({ name: '', emoji: '🛒', color: '#8b5cf6' });
        onClose();
      } else {
        setError(result.error || 'Failed to create list');
      }
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className={styles.backdrop}
            aria-hidden="true"
          />

          {/* Modal */}
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h2 id="modal-title" className={styles.title}>
              Create Shopping List
            </h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Name Input */}
              <div className={styles.formGroup}>
                <label htmlFor="list-name" className={styles.label}>
                  List Name
                </label>
                <input
                  id="list-name"
                  type="text"
                  placeholder="e.g., Groceries, Hardware Store..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  maxLength={50}
                  className={styles.input}
                  autoFocus
                  disabled={isPending}
                />
                <span className={styles.charCount}>
                  {formData.name.length}/50
                </span>
              </div>

              {/* Emoji Selector */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Emoji (Optional)</label>
                <div className={styles.emojiGrid}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`${styles.emojiOption} ${
                        formData.emoji === emoji ? styles.selected : ''
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isPending}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Color (Optional)</label>
                <div className={styles.colorGrid}>
                  {COLOR_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, color: preset.value })
                      }
                      className={`${styles.colorOption} ${
                        formData.color === preset.value ? styles.selected : ''
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.label}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isPending}
                    />
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.error}
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isPending || !formData.name.trim()}
                  className={styles.submitButton}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {isPending ? 'Creating...' : 'Create List'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
