import { ShoppingItem, ShoppingList, Product, ShoppingCategory } from '@prisma/client';

export type ShoppingItemWithCreator = ShoppingItem & {
  createdBy: { name: string };
  shoppingList?: { name: string; emoji?: string | null };
  product?: { name: string } | null;
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
}

export type CatalogSuggestion = {
  id: string;
  name: string;
  emoji?: string | null;
  category: ShoppingCategory;
  defaultUnit?: string | null;
  score: number;
  source: 'catalog';
};

export type HistorySuggestion = {
  name: string;
  emoji?: string | null;
  category: ShoppingCategory;
  defaultUnit?: string | null;
  score: number;
  source: 'history' | 'smart';
};

export type ProductSuggestion = CatalogSuggestion | HistorySuggestion;

export interface ShoppingItemInput {
  name: string;
  quantity?: string;
  unit?: string;
  category?: ShoppingCategory;
  emoji?: string;
}
