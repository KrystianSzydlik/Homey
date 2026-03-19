'use client';

import clsx from 'clsx';
import styles from './CircularCheckbox.module.scss';

type CheckboxSize = 'sm' | 'md';

interface CircularCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: CheckboxSize;
  'aria-label': string;
  disabled?: boolean;
  className?: string;
}

export default function CircularCheckbox({
  checked,
  onChange,
  size = 'md',
  'aria-label': ariaLabel,
  disabled = false,
  className,
}: CircularCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onChange(!checked)}
      className={clsx(styles.checkbox, styles[size], className)}
      aria-label={ariaLabel}
      disabled={disabled}
    />
  );
}
