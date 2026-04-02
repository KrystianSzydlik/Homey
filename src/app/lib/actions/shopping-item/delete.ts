'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { itemIdSchema } from '@/app/lib/validation/shopping-schemas';

export async function deleteShoppingItem(
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

    await prisma.shoppingItem.delete({
      where: { id: validatedId },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error deleting shopping item:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}
