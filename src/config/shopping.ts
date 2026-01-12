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
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Blue', value: '#0ea5e9' },
  { label: 'Green', value: '#10b981' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Amber', value: '#f59e0b' },
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
export const DEFAULT_LIST_COLOR = '#8b5cf6';
export const DEFAULT_ITEM_CATEGORY: ShoppingCategory = 'OTHER';
export const DEFAULT_ITEM_QUANTITY = '1';
