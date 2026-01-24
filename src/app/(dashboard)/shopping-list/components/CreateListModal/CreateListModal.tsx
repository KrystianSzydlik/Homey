'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/shared/Modal';
import { createShoppingList } from '@/app/lib/shopping-list-actions';
import { ShoppingListWithCreator } from '@/types/shopping';
import {
  EMOJI_OPTIONS,
  COLOR_PRESETS,
  DEFAULT_LIST_EMOJI,
  DEFAULT_LIST_COLOR,
} from '@/config/shopping';
import styles from './CreateListModal.module.scss';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (list: ShoppingListWithCreator) => void;
}

export default function CreateListModal({
  isOpen,
  onClose,
  onListCreated,
}: CreateListModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    emoji: DEFAULT_LIST_EMOJI,
    color: DEFAULT_LIST_COLOR,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content size="md">
        <Modal.Header>
          <Modal.Title>Create Shopping List</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit} className={styles.form}>
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
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Modal.CancelButton disabled={isPending}>Cancel</Modal.CancelButton>
          <motion.button
            type="submit"
            disabled={isPending || !formData.name.trim()}
            className={styles.submitButton}
            onClick={handleSubmit}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            {isPending ? 'Creating...' : 'Create List'}
          </motion.button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
