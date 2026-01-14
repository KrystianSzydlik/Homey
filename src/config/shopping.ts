import { ShoppingCategory } from '@prisma/client';

export const EMOJI_OPTIONS = [
  '🛒',
  '📝',
  '🍔',
  '🥗',
  '🥤',
  '🍕',
  '🥩',
  '🧀',
  '🏪',
  '🛍️',
] as const;

export const COLOR_PRESETS = [
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Pink', value: '#f06292' },
  { label: 'Golden', value: '#ffd54f' },
  { label: 'Amber', value: '#af8f2c' },
] as const;

export const CATEGORIES: {
  value: ShoppingCategory | 'ALL';
  label: string;
  emoji: string;
}[] = [
  { value: 'ALL', label: 'Wszystkie', emoji: '📋' },
  { value: 'VEGETABLES', label: 'Warzywa', emoji: '🥬' },
  { value: 'DAIRY', label: 'Nabiał', emoji: '🥛' },
  { value: 'MEAT', label: 'Mięso i Ryby', emoji: '🍖' },
  { value: 'BAKERY', label: 'Pieczywo', emoji: '🍞' },
  { value: 'FRUITS', label: 'Owoce', emoji: '🍎' },
  { value: 'FROZEN', label: 'Mrożonki', emoji: '❄️' },
  { value: 'DRINKS', label: 'Napoje', emoji: '🥤' },
  { value: 'CONDIMENTS', label: 'Przyprawy i Spiżarnia', emoji: '🧂' },
  { value: 'SWEETS', label: 'Słodycze', emoji: '🍫' },
  { value: 'OTHER', label: 'Inne', emoji: '📦' },
] as const;

export const DEFAULT_LIST_EMOJI = '🛒';
export const DEFAULT_LIST_COLOR = '#f43f5e';
export const DEFAULT_ITEM_CATEGORY: ShoppingCategory = 'OTHER';
export const DEFAULT_ITEM_QUANTITY = '1';
