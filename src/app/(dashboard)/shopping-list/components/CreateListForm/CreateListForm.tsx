'use client';

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { createShoppingListSchema } from '@/app/lib/validation/shopping-schemas';
import { EmojiPicker } from '@/components/shared/EmojiPicker';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { ShoppingListActionResult, ShoppingListWithCreator } from '@/types/shopping';
import { LIST_EMOJI_GROUPS } from '@/config/emojis';
import { DEFAULT_LIST_EMOJI, DEFAULT_LIST_COLOR } from '@/config/shopping';
import styles from './CreateListForm.module.scss';

type CreateListFormData = z.infer<typeof createShoppingListSchema>;

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
    watch,
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

  const currentEmoji = watch('emoji') || DEFAULT_LIST_EMOJI;

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
      {/* Name section with emoji preview */}
      <div className={styles.section}>
        <h4 className={styles.sectionLabel}>Nazwa listy</h4>
        <div className={styles.nameRow}>
          <div className={styles.emojiPreview}>{currentEmoji}</div>
          <input
            id="list-name"
            type="text"
            placeholder="np. Biedronka, Castorama..."
            className={styles.nameInput}
            autoFocus
            disabled={isPending}
            {...register('name')}
          />
        </div>
        {errors.name && (
          <span className={styles.errorMessage}>{errors.name.message}</span>
        )}
      </div>

      {/* Emoji section */}
      <div className={styles.section}>
        <h4 className={styles.sectionLabel}>Emoji</h4>
        <Controller
          control={control}
          name="emoji"
          render={({ field }) => (
            <EmojiPicker
              value={field.value || DEFAULT_LIST_EMOJI}
              onChange={field.onChange}
              groups={LIST_EMOJI_GROUPS}
              disabled={isPending}
            />
          )}
        />
      </div>

      {/* Color section */}
      <div className={styles.section}>
        <h4 className={styles.sectionLabel}>Kolor</h4>
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
          Anuluj
        </button>
        <motion.button
          type="submit"
          disabled={isPending}
          className={styles.submitButton}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          {isPending ? 'Tworzenie...' : 'Utwórz listę'}
        </motion.button>
      </div>
    </form>
  );
}
