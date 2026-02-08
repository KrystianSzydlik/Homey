'use client';

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { createShoppingListSchema } from '@/app/lib/validation/shopping-schemas';
import { EmojiPicker } from '@/components/shared/EmojiPicker';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { ShoppingListActionResult } from '@/types/shopping';
import styles from './CreateListForm.module.scss';
import { DEFAULT_LIST_EMOJI, DEFAULT_LIST_COLOR } from '@/config/shopping';
import React from 'react';

// Re-using the types from the schema
import { z } from 'zod';
type CreateListFormData = z.infer<typeof createShoppingListSchema>;

import { ShoppingListWithCreator } from '@/types/shopping';

interface CreateListFormProps {
  onSubmitAction: (
    data: CreateListFormData
  ) => Promise<ShoppingListActionResult>;
  onSuccess: (list: ShoppingListWithCreator) => void;
  onCancel: () => void;
}

export function CreateListForm({
  onSubmitAction,
  onSuccess,
  onCancel,
}: CreateListFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CreateListFormData>({
    resolver: zodResolver(createShoppingListSchema),
    defaultValues: {
      name: '',
      emoji: DEFAULT_LIST_EMOJI,
      color: DEFAULT_LIST_COLOR,
    },
  });

  const onSubmit = (data: CreateListFormData) => {
    startTransition(async () => {
      const result = await onSubmitAction(data);

      if (result.success && result.list) {
        onSuccess(result.list);
      } else {
        setError('root', {
          message: result.error || 'Failed to create list',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="list-name" className={styles.label}>
          List Name
        </label>
        <input
          id="list-name"
          type="text"
          placeholder="e.g., Groceries, Hardware Store..."
          className={styles.input}
          autoFocus
          disabled={isPending}
          {...register('name')}
        />
        {errors.name && (
          <span className={styles.errorMessage}>{errors.name.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Emoji (Optional)</label>
        <Controller
          control={control}
          name="emoji"
          render={({ field }) => (
            <EmojiPicker
              value={field.value || DEFAULT_LIST_EMOJI}
              onChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Color (Optional)</label>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <ColorPicker
              value={field.value || DEFAULT_LIST_COLOR}
              onChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
      </div>

      {errors.root && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.error}
          role="alert"
        >
          {errors.root.message}
        </motion.div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          disabled={isPending}
          className={styles.submitButton}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          {isPending ? 'Creating...' : 'Create List'}
        </motion.button>
      </div>
    </form>
  );
}
