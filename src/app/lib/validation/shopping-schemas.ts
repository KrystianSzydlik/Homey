import { z } from 'zod';
import { ShoppingCategory } from '@prisma/client';

export const nameField = z.string().min(1, 'Name is required').max(100, 'Name too long');
export const quantityField = z.string().max(20);
export const unitField = z.string().max(20);
export const categoryField = z.nativeEnum(ShoppingCategory);
export const emojiField = z.string().max(10);
export const shoppingListIdField = z.string().min(1, 'Shopping list ID is required');
export const productIdField = z.string();
export const colorField = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const createShoppingItemSchema = z.object({
  name: nameField,
  quantity: quantityField.optional(),
  unit: unitField.optional(),
  category: categoryField.optional(),
  emoji: emojiField.optional(),
  shoppingListId: shoppingListIdField,
  productId: productIdField,
});

export const updateShoppingItemSchema = z.object({
  name: nameField.optional(),
  quantity: quantityField.optional(),
  unit: unitField.optional(),
  category: categoryField.optional(),
  emoji: emojiField.optional(),
  checked: z.boolean().optional(),
  productId: productIdField.optional(),
});

export const createShoppingListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  emoji: emojiField.optional(),
  color: colorField.optional(),
});

export const updateShoppingListSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  emoji: emojiField.optional(),
  color: colorField.optional(),
});

export const createProductSchema = z.object({
  name: nameField,
  emoji: emojiField.optional(),
  defaultCategory: categoryField.optional(),
  defaultUnit: unitField.optional(),
});

export const searchQuerySchema = z.string().min(1).max(100);

export const clearCheckedItemsSchema = z.object({
  itemIds: z.array(z.string().min(1, 'Item ID is required')).min(1),
});
