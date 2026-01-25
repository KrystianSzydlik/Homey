'use client';

import { useState } from 'react';
import { Popover } from '@/components/shared/Popover';
import { FOOD_EMOJIS } from '@/config/emojis';
import styles from './EmojiPicker.module.scss';

interface EmojiPickerProps {
  currentEmoji: string;
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({
  currentEmoji,
  onSelect,
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger className={styles.trigger}>
        <span className={styles.currentEmoji}>{currentEmoji}</span>
        <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
      </Popover.Trigger>

      <Popover.Content align="start" sideOffset={8} className={styles.popover}>
        <Popover.Header className={styles.header}>
          <Popover.Title className={styles.headerTitle}>
            Wybierz ikonę
          </Popover.Title>
          <Popover.CloseButton className={styles.closeBtn} />
        </Popover.Header>
        <Popover.Body className={styles.content}>
          {FOOD_EMOJIS.map((group) => (
            <div key={group.category} className={styles.group}>
              <h3 className={styles.categoryTitle}>{group.category}</h3>
              <div className={styles.emojiGrid}>
                {group.emojis.map((emoji, idx) => (
                  <button
                    key={`${group.category}-${emoji}-${idx}`}
                    type="button"
                    className={`${styles.emojiBtn} ${
                      currentEmoji === emoji ? styles.active : ''
                    }`}
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Popover.Body>
      </Popover.Content>
    </Popover>
  );
}
