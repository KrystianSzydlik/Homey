'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { clearCheckedItemsSchema } from '@/app/lib/validation/shopping-schemas';

export async function clearCheckedItems(input: {
  itemIds: string[];
}): Promise<ShoppingItemActionResult> {
  try {
    const householdId = await getHouseholdId();
    const validatedInput = clearCheckedItemsSchema.parse(input);

    const result = await prisma.shoppingItem.deleteMany({
      where: {
        householdId,
        checked: true,
        id: { in: validatedInput.itemIds },
      },
    });

    return { success: true, deletedCount: result.count };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error clearing checked items:', error);
    return { success: false, error: 'Failed to clear items' };
  }
}
