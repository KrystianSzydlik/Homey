'use client';

import { ReactNode } from 'react';
import { Popover } from '@/components/shared/Popover';
import styles from './Dropdown.module.scss';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface DropdownGroup<T = string> {
  label: string;
  options: DropdownOption<T>[];
}

interface DropdownProps<T = string> {
  value: T | null;
  onChange: (value: T) => void;
  options?: DropdownOption<T>[];
  groups?: DropdownGroup<T>[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropdown<T extends string = string>({
  value,
  onChange,
  options,
  groups,
  placeholder = 'Wybierz...',
  className,
  disabled = false,
}: DropdownProps<T>) {
  const selectedOption =
    options?.find((opt) => opt.value === value) ||
    groups?.flatMap((g) => g.options).find((opt) => opt.value === value);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
  };

  const renderOption = (option: DropdownOption<T>) => (
    <button
      key={option.value}
      type="button"
      className={`${styles.option} ${value === option.value ? styles.active : ''}`}
      onClick={() => handleSelect(option.value)}
    >
      {option.icon && <span className={styles.optionIcon}>{option.icon}</span>}
      <span className={styles.optionLabel}>{option.label}</span>
      {value === option.value && <span className={styles.check}>✓</span>}
    </button>
  );

  return (
    <Popover>
      <Popover.Trigger
        className={`${styles.trigger} ${className || ''}`}
        disabled={disabled}
      >
        <div className={styles.triggerContent}>
          {selectedOption?.icon && (
            <span className={styles.triggerIcon}>{selectedOption.icon}</span>
          )}
          <span className={styles.label}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <span className={styles.chevron}>▼</span>
      </Popover.Trigger>

      <Popover.Content
        align="start"
        sideOffset={8}
        matchTriggerWidth
        className={styles.popover}
      >
        <Popover.Body className={styles.content}>
          {options && options.map(renderOption)}

          {groups &&
            groups.map((group) => (
              <div key={group.label} className={styles.group}>
                <div className={styles.groupLabel}>{group.label}</div>
                {group.options.map(renderOption)}
              </div>
            ))}
        </Popover.Body>
      </Popover.Content>
    </Popover>
  );
}
