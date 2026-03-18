import { motion } from 'framer-motion';
import { useId } from 'react';
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
  const colorGridId = useId();

  return (
    <div className={styles.colorGrid} role="group" aria-labelledby={`color-picker-label-${colorGridId}`}>
      {/* Visually hidden label for screen readers */}
      <div id={`color-picker-label-${colorGridId}`} style={{ display: 'none' }}>
        Color selection
      </div>
      {options.map((preset) => (
        <motion.button
          key={preset.value}
          type="button"
          onClick={() => onChange(preset.value)}
          className={`${styles.colorOption} ${
            value === preset.value ? styles.selected : ''
          }`}
          style={{ backgroundColor: preset.value }}
          aria-label={`${preset.label} color`}
          aria-current={value === preset.value ? 'true' : undefined}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
