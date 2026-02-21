export interface EmojiGroup {
  readonly category: string;
  readonly emojis: readonly string[];
}

export const PRODUCT_EMOJI_GROUPS: readonly EmojiGroup[] = [
  {
    category: 'Owoce',
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
      '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑',
    ],
  },
  {
    category: 'Warzywa',
    emojis: [
      '🍆', '🥔', '🥕', '🌽', '🫑', '🥒', '🥬', '🥦',
      '🧄', '🧅', '🍄', '🥜', '🫘', '🌰', '🫚', '🫛',
    ],
  },
  {
    category: 'Nabiał i Jajka',
    emojis: ['🥚', '🥛', '🍼', '🧀', '🧈', '🍦', '🍨', '🍧'],
  },
  {
    category: 'Mięso i Ryby',
    emojis: [
      '🍗', '🥩', '🥓', '🍔', '🌭', '🥪', '🍖', '🍤',
      '🍣', '🍱', '🐟', '🐙', '🦀', '🦞',
    ],
  },
  {
    category: 'Piekarnia i Spiżarnia',
    emojis: [
      '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇',
      '🍚', '🍝', '🍜', '🥧', '🥣', '🥫', '🧂', '🍯',
    ],
  },
  {
    category: 'Słodycze i Przekąski',
    emojis: [
      '🍫', '🍬', '🍭', '🧁', '🍰', '🎂', '🍩', '🍪',
      '🍿', '🍘', '🍙',
    ],
  },
  {
    category: 'Napoje',
    emojis: [
      '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂',
      '🍷', '🥃', '🍸', '🍹', '🧉', '🧊',
    ],
  },
  {
    category: 'Inne',
    emojis: [
      '🛒', '🛍️', '🧼', '🧻', '🪠', '🧺', '🧹', '🧴',
      '🕯️', '📦', '🎁', '🖼️', '🔋', '🩹',
    ],
  },
] as const;

export const LIST_EMOJI_GROUPS: readonly EmojiGroup[] = [
  {
    category: 'Sklepy i Miejsca',
    emojis: [
      '🛒', '🏪', '🏬', '🏠', '🏥', '💊', '🐾', '🌿',
      '🏢', '🏫', '⛽', '🔧', '🛠️', '🏗️',
    ],
  },
  {
    category: 'Jedzenie',
    emojis: [
      '🍔', '🥗', '🍕', '🥩', '🧀', '🍞', '🥤', '☕',
      '🍎', '🥦', '🍰', '🍣', '🥚', '🍷',
    ],
  },
  {
    category: 'Okazje',
    emojis: [
      '🎄', '🎃', '🎉', '🎂', '🎁', '💝', '🎊', '🥳',
      '🐣', '🎆', '🪔', '🕎',
    ],
  },
  {
    category: 'Dom',
    emojis: [
      '🧹', '🔧', '🛋️', '🪴', '🧺', '🧼', '💡', '🪣',
      '🛏️', '🚿', '🪟', '🖼️',
    ],
  },
  {
    category: 'Transport',
    emojis: [
      '🚗', '✈️', '🚂', '🚲', '⛵', '🏕️', '🎒', '🧳',
    ],
  },
  {
    category: 'Inne',
    emojis: [
      '📝', '📋', '✅', '❤️', '⭐', '🔥', '💰', '🎯',
      '📦', '🏷️', '🔔', '💼',
    ],
  },
] as const;

/** @deprecated Use PRODUCT_EMOJI_GROUPS instead */
export const FOOD_EMOJIS = PRODUCT_EMOJI_GROUPS;

/** Flat array of all product emojis */
export const ALL_PRODUCT_EMOJIS: readonly string[] =
  PRODUCT_EMOJI_GROUPS.flatMap((g) => g.emojis);

/** Flat array of all list emojis */
export const ALL_LIST_EMOJIS: readonly string[] =
  LIST_EMOJI_GROUPS.flatMap((g) => g.emojis);
