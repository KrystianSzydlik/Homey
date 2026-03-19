'use client';

import { useCallback, useRef, useState } from 'react';
import styles from './BottomQuickAddBar.module.scss';

interface BottomQuickAddBarProps {
  onAddItem: (name: string) => void;
  disabled?: boolean;
}

export default function BottomQuickAddBar({
  onAddItem,
  disabled = false,
}: BottomQuickAddBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    onAddItem(trimmed);
    setValue('');
    inputRef.current?.focus();
  }, [value, onAddItem]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className={styles.bar}>
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dodaj produkt..."
          className={styles.input}
          disabled={disabled}
          aria-label="Szybkie dodawanie produktu"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className={styles.addButton}
          aria-label="Dodaj produkt"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
