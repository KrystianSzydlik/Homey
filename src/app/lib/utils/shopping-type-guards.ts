import { ShoppingCategory } from '@prisma/client';

/**
 * Type guard to safely narrow string values to ShoppingCategory enum.
 * Eliminates unsafe `as ShoppingCategory` assertions.
 */

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

/**
 * Type guard for discriminated union of product suggestions.
 * Safely narrows ProductSuggestion types without `as` assertions.
 */
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
