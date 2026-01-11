'use client';

import { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.currentEmoji}>{currentEmoji}</span>
        <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.header}>
            <span>Wybierz ikonę</span>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          <div className={styles.content}>
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
                      onClick={() => {
                        onSelect(emoji);
                        setIsOpen(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
