import { motion } from 'framer-motion';
import { EMOJI_OPTIONS } from '@/config/shopping';
import styles from './EmojiPicker.module.scss';
import React from 'react';

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
  options?: typeof EMOJI_OPTIONS | readonly string[];
  disabled?: boolean;
}

export function EmojiPicker({
  value,
  onChange,
  options = EMOJI_OPTIONS,
  disabled = false,
}: EmojiPickerProps) {
  return (
    <div className={styles.emojiGrid}>
      {options.map((emoji) => (
        <motion.button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`${styles.emojiOption} ${
            value === emoji ? styles.selected : ''
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
