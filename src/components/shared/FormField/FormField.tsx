'use client';

import { useId, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import { getAriaDescribedBy } from '@/app/lib/utils/accessibility';
import styles from './FormField.module.scss';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
}

export function FormField({
  label,
  error,
  helperText,
  required,
  disabled,
  ...inputProps
}: FormFieldProps) {
  const fieldId = useId();
  const errorId = useId();
  const helperId = useId();

  const ariaDescribedBy = getAriaDescribedBy(
    error ? errorId : undefined,
    helperText ? helperId : undefined
  );

  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-label="required">*</span>}
      </label>

      <input
        id={fieldId}
        {...inputProps}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />

      {error && (
        <span
          id={errorId}
          className={styles.errorMessage}
          role="alert"
        >
          {error.message}
        </span>
      )}

      {helperText && !error && (
        <span
          id={helperId}
          className={styles.helperText}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
