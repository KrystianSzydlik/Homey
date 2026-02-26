'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { listIdSchema } from '@/app/lib/validation/shopping-schemas';

export async function deleteAllShoppingItems(
  shoppingListId: string
): Promise<ShoppingItemActionResult> {
  try {
    const validatedListId = listIdSchema.parse(shoppingListId);
    const householdId = await getHouseholdId();

    const shoppingList = await prisma.shoppingList.findFirst({
      where: { id: validatedListId, householdId },
    });

    if (!shoppingList) {
      return { success: false, error: 'Shopping list not found' };
    }

    const result = await prisma.shoppingItem.deleteMany({
      where: { shoppingListId: validatedListId },
    });

    return { success: true, deletedCount: result.count };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error deleting all shopping items:', error);
    return { success: false, error: 'Failed to delete items' };
  }
}
