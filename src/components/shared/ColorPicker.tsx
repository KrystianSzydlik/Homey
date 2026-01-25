import { motion } from 'framer-motion';
import { COLOR_PRESETS } from '@/config/shopping';
import styles from './ColorPicker.module.scss';
import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  options?: typeof COLOR_PRESETS | readonly { label: string; value: string }[];
  disabled?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  options = COLOR_PRESETS,
  disabled = false,
}: ColorPickerProps) {
  return (
    <div className={styles.colorGrid}>
      {options.map((preset) => (
        <motion.button
          key={preset.value}
          type="button"
          onClick={() => onChange(preset.value)}
          className={`${styles.colorOption} ${
            value === preset.value ? styles.selected : ''
          }`}
          style={{ backgroundColor: preset.value }}
          title={preset.label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
