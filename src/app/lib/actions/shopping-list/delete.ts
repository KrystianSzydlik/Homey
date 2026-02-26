'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingListActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { listIdSchema } from '@/app/lib/validation/shopping-schemas';

export async function deleteShoppingList(
  listId: string
): Promise<ShoppingListActionResult> {
  try {
    const validatedId = listIdSchema.parse(listId);
    const householdId = await getHouseholdId();

    const list = await prisma.shoppingList.findFirst({
      where: { id: validatedId, householdId },
    });

    if (!list) {
      return { success: false, error: 'Shopping list not found' };
    }

    await prisma.shoppingList.delete({
      where: { id: validatedId },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error deleting shopping list:', error);
    return { success: false, error: 'Failed to delete list' };
  }
}
