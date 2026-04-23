'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getSessionData } from '@/app/lib/auth-utils';
import { itemIdSchema } from '@/app/lib/validation/shopping-schemas';
import { recordPurchase } from './record-purchase';

export async function toggleShoppingItemChecked(
  itemId: string
): Promise<ShoppingItemActionResult> {
  try {
    const validatedId = itemIdSchema.parse(itemId);
    const session = await getSessionData();

    const existing = await prisma.shoppingItem.findFirst({
      where: { id: validatedId, householdId: session.householdId },
      select: { checked: true },
    });

    if (!existing) {
      return { success: false, error: 'Item not found' };
    }

    const newCheckedState = !existing.checked;

    const updatedItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.shoppingItem.update({
        where: { id: validatedId },
        data: { checked: newCheckedState },
        include: {
          createdBy: { select: { name: true } },
          shoppingList: { select: { name: true, emoji: true } },
          product: { select: { name: true, emoji: true } },
        },
      });

      if (newCheckedState) {
        await recordPurchase(tx, {
          productId: updated.productId,
          shoppingItemId: updated.id,
          quantity: parseFloat(updated.quantity) || 1,
          unit: updated.unit,
          householdId: session.householdId,
          userId: session.userId,
        });
      }

      return updated;
    });

    return { success: true, item: updatedItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error toggling shopping item:', error);
    return { success: false, error: 'Failed to toggle item' };
  }
}
