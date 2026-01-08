import { ShoppingItem } from '@prisma/client';

export type ShoppingItemWithCreator = ShoppingItem & {
  createdBy: { name: string };
};

export interface ShoppingItemActionResult {
  success: boolean;
  item?: ShoppingItemWithCreator;
  error?: string;
  deletedCount?: number;
}

export interface ShoppingItemInput {
  name: string;
  quantity?: string;
  unit?: string;
  category?: string;
  emoji?: string;
}
