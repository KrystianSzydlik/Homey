import { ShoppingCategory } from '@prisma/client';

const VALID_CATEGORIES = new Set<string>([
  'VEGETABLES',
  'DAIRY',
  'MEAT',
  'BAKERY',
  'FRUITS',
  'FROZEN',
  'DRINKS',
  'CONDIMENTS',
  'SWEETS',
  'OTHER',
]);

export function isShoppingCategory(value: unknown): value is ShoppingCategory {
  return typeof value === 'string' && VALID_CATEGORIES.has(value);
}

export function ensureShoppingCategory(
  value: unknown,
  fallback: ShoppingCategory = 'OTHER'
): ShoppingCategory {
  return isShoppingCategory(value) ? value : fallback;
}

export interface ProductSuggestionWithSource {
  name: string;
  emoji?: string | null;
  category: ShoppingCategory;
  source: 'catalog' | 'history' | 'smart';
}

export function hasCatalogSource(
  suggestion: ProductSuggestionWithSource
): suggestion is ProductSuggestionWithSource & { source: 'catalog' } {
  return suggestion.source === 'catalog';
}

export function hasHistorySource(
  suggestion: ProductSuggestionWithSource
): suggestion is ProductSuggestionWithSource & { source: 'history' } {
  return suggestion.source === 'history';
}

export function hasSmartSource(
  suggestion: ProductSuggestionWithSource
): suggestion is ProductSuggestionWithSource & { source: 'smart' } {
  return suggestion.source === 'smart';
}
