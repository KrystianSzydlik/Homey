'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingListActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';

const listIdsSchema = z.array(z.string().cuid('Invalid list ID')).min(1);

export async function reorderShoppingLists(
  listIds: string[]
): Promise<ShoppingListActionResult> {
  try {
    const validatedListIds = listIdsSchema.parse(listIds);
    const householdId = await getHouseholdId();

    const lists = await prisma.shoppingList.findMany({
      where: { householdId, id: { in: validatedListIds } },
    });

    if (lists.length !== validatedListIds.length) {
      return { success: false, error: 'Some lists not found' };
    }

    await prisma.$transaction(
      validatedListIds.map((id, index) =>
        prisma.shoppingList.update({
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
    console.error('Error reordering shopping lists:', error);
    return { success: false, error: 'Failed to reorder lists' };
  }
}
