export { type Product, type ShoppingItem } from '@prisma/client';
import {
  ShoppingItem,
  ShoppingList,
  Product,
  ShoppingCategory,
} from '@prisma/client';

export type ShoppingItemWithCreator = ShoppingItem & {
  createdBy: { name: string };
  shoppingList?: { name: string; emoji?: string | null };
  product?: { name: string; emoji?: string | null } | null;
};

export type ShoppingListWithItems = ShoppingList & {
  items: ShoppingItemWithCreator[];
  createdBy: { name: string };
  _count: { items: number };
};

export type ShoppingListWithCreator = ShoppingList & {
  createdBy: { name: string };
  _count: { items: number };
};

export type ProductWithStats = Product & {
  createdBy?: { name: string } | null;
};

export interface ShoppingItemActionResult {
  success: boolean;
  item?: ShoppingItemWithCreator;
  error?: string;
  deletedCount?: number;
}

export interface ShoppingListActionResult {
  success: boolean;
  list?: ShoppingListWithCreator;
  error?: string;
}

export interface ProductActionResult {
  success: boolean;
  product?: Product;
  error?: string;
  existingProduct?: Product;
}

export type CatalogSuggestion = {
  readonly id: string;
  readonly name: string;
  readonly emoji?: string | null;
  readonly category: ShoppingCategory;
  readonly defaultUnit?: string | null;
  readonly score: number;
  readonly source: 'catalog';
};

export type HistorySuggestion = {
  readonly name: string;
  readonly emoji?: string | null;
  readonly category: ShoppingCategory;
  readonly defaultUnit?: string | null;
  readonly score: number;
  readonly source: 'history' | 'smart';
};

export type ProductSuggestion = CatalogSuggestion | HistorySuggestion;

export function isCatalogSuggestion(
  suggestion: ProductSuggestion
): suggestion is CatalogSuggestion {
  return suggestion.source === 'catalog';
}

export function isHistorySuggestion(
  suggestion: ProductSuggestion
): suggestion is HistorySuggestion {
  return suggestion.source === 'history' || suggestion.source === 'smart';
}

export interface ShoppingItemInput {
  name: string;
  quantity?: string;
  unit?: string;
  category?: ShoppingCategory;
  emoji?: string;
}
