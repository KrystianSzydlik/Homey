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

export const CATEGORIES: { value: ShoppingCategory | 'ALL'; label: string; emoji: string }[] = [
  { value: 'ALL', label: 'All', emoji: '📋' },
  { value: 'VEGETABLES', label: 'Vegetables', emoji: '🥬' },
  { value: 'DAIRY', label: 'Dairy', emoji: '🥛' },
  { value: 'MEAT', label: 'Meat', emoji: '🍖' },
  { value: 'BAKERY', label: 'Bakery', emoji: '🍞' },
  { value: 'FRUITS', label: 'Fruits', emoji: '🍎' },
  { value: 'FROZEN', label: 'Frozen', emoji: '❄️' },
  { value: 'DRINKS', label: 'Drinks', emoji: '🥤' },
  { value: 'CONDIMENTS', label: 'Condiments', emoji: '🧂' },
  { value: 'SWEETS', label: 'Sweets', emoji: '🍫' },
  { value: 'OTHER', label: 'Other', emoji: '📦' },
] as const;

export const DEFAULT_LIST_EMOJI = '🛒';
export const DEFAULT_LIST_COLOR = '#8b5cf6';
export const DEFAULT_ITEM_CATEGORY: ShoppingCategory = 'OTHER';
export const DEFAULT_ITEM_QUANTITY = '1';
