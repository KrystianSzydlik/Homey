import { motion } from 'framer-motion';
import { useId } from 'react';
import { EMOJI_OPTIONS } from '@/config/shopping';
import type { EmojiGroup } from '@/config/emojis';
import styles from './EmojiPicker.module.scss';

interface EmojiPickerBaseProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface EmojiPickerFlatProps extends EmojiPickerBaseProps {
  options?: typeof EMOJI_OPTIONS | readonly string[];
  groups?: never;
}

interface EmojiPickerGroupedProps extends EmojiPickerBaseProps {
  options?: never;
  groups: readonly EmojiGroup[];
}

type EmojiPickerProps = EmojiPickerFlatProps | EmojiPickerGroupedProps;

function EmojiButton({
  emoji,
  isSelected,
  disabled,
  onClick,
}: {
  emoji: string;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`${styles.emojiOption} ${isSelected ? styles.selected : ''}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      aria-label={`Select emoji: ${emoji}`}
      aria-pressed={isSelected}
    >
      {emoji}
    </motion.button>
  );
}

export function EmojiPicker(props: EmojiPickerProps) {
  const { value, onChange, disabled = false } = props;
  const groupIdPrefix = useId();

  // Grouped mode
  if ('groups' in props && props.groups) {
    return (
      <div className={styles.groupedContainer}>
        {props.groups.map((group) => {
          const groupId = `emoji-group-${groupIdPrefix}-${group.category}`;
          return (
            <div
              key={group.category}
              className={styles.group}
              role="group"
              aria-labelledby={groupId}
            >
              <h4 id={groupId} className={styles.groupTitle}>{group.category}</h4>
              <div className={styles.emojiGrid}>
                {group.emojis.map((emoji) => (
                  <EmojiButton
                    key={`${group.category}-${emoji}`}
                    emoji={emoji}
                    isSelected={value === emoji}
                    disabled={disabled}
                    onClick={() => onChange(emoji)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Flat mode (backward compatible)
  const options = props.options ?? EMOJI_OPTIONS;

  return (
    <div className={styles.emojiGrid}>
      {options.map((emoji) => (
        <EmojiButton
          key={emoji}
          emoji={emoji}
          isSelected={value === emoji}
          disabled={disabled}
          onClick={() => onChange(emoji)}
        />
      ))}
    </div>
  );
}
