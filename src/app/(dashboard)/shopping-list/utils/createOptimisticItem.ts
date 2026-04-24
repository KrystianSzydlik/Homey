import { ShoppingCategory } from '@prisma/client';
import { ShoppingItemWithCreator } from '@/types/shopping';

interface CreateOptimisticItemParams {
  listId: string;
  name: string;
  productId?: string;
  product?: {
    emoji?: string | null;
    defaultUnit?: string | null;
    category?: ShoppingCategory;
  };
}

export function createOptimisticItem({
  listId,
  name,
  productId,
  product,
}: CreateOptimisticItemParams): ShoppingItemWithCreator {
  return {
    id: `temp-${Date.now()}`,
    name,
    quantity: '1',
    unit: product?.defaultUnit || null,
    category: product?.category || 'OTHER',
    checked: false,
    position: 0,
    shoppingListId: listId,
    emoji: null,
    note: null,
    productId: productId ?? '',
    householdId: '',
    createdById: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { name: 'You' },
    product: product ? { name, emoji: product.emoji ?? null } : null,
  };
}
