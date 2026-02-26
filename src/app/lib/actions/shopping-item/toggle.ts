'use server';

import { prisma } from '@/lib/prisma';
import { serializeDecimals } from '@/lib/serializers';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { itemIdSchema } from '@/app/lib/validation/shopping-schemas';
import { calculatePurchaseStats } from './purchase-statistics';

export async function toggleShoppingItemChecked(
  itemId: string
): Promise<ShoppingItemActionResult> {
  try {
    const validatedId = itemIdSchema.parse(itemId);
    const householdId = await getHouseholdId();

    const item = await prisma.shoppingItem.findFirst({
      where: { id: validatedId, householdId },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    const newCheckedState = !item.checked;
    const statsUpdate = calculatePurchaseStats(item, newCheckedState);

    const updatedItem = await prisma.shoppingItem.update({
      where: { id: validatedId },
      data: {
        checked: newCheckedState,
        ...statsUpdate,
      },
      include: {
        createdBy: {
          select: { name: true },
        },
        shoppingList: {
          select: { name: true, emoji: true },
        },
        product: {
          select: { name: true, emoji: true },
        },
      },
    });

    return { success: true, item: serializeDecimals(updatedItem) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error toggling shopping item:', error);
    return { success: false, error: 'Failed to toggle item' };
  }
}
