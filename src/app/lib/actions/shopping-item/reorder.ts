'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { listIdSchema, itemIdsSchema } from '@/app/lib/validation/shopping-schemas';

export async function reorderShoppingItems(
  shoppingListId: string,
  itemIds: string[]
): Promise<ShoppingItemActionResult> {
  try {
    const validatedListId = listIdSchema.parse(shoppingListId);
    const validatedItemIds = itemIdsSchema.parse(itemIds);
    const householdId = await getHouseholdId();

    const items = await prisma.shoppingItem.findMany({
      where: { householdId, shoppingListId: validatedListId, id: { in: validatedItemIds } },
    });

    if (items.length !== validatedItemIds.length) {
      return { success: false, error: 'Some items not found' };
    }

    await prisma.$transaction(
      validatedItemIds.map((id, index) =>
        prisma.shoppingItem.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error reordering shopping items:', error);
    return { success: false, error: 'Failed to reorder items' };
  }
}
