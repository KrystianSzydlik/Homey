'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingListActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { updateShoppingListSchema } from '@/app/lib/validation/shopping-schemas';

interface UpdateShoppingListInput {
  name?: string;
  emoji?: string;
  color?: string;
}

export async function updateShoppingList(
  listId: string,
  input: UpdateShoppingListInput
): Promise<ShoppingListActionResult> {
  try {
    const householdId = await getHouseholdId();

    const validatedInput = updateShoppingListSchema.parse(input);

    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, householdId },
    });

    if (!list) {
      return { success: false, error: 'Shopping list not found' };
    }

    const updateData: Partial<{
      name: string;
      emoji: string | null;
      color: string | null;
    }> = {};
    if (validatedInput.name !== undefined)
      updateData.name = validatedInput.name;
    if (validatedInput.emoji !== undefined)
      updateData.emoji = validatedInput.emoji;
    if (validatedInput.color !== undefined)
      updateData.color = validatedInput.color;

    const updatedList = await prisma.shoppingList.update({
      where: { id: listId },
      data: updateData,
      include: {
        createdBy: {
          select: { name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return { success: true, list: updatedList };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error updating shopping list:', error);
    return { success: false, error: 'Failed to update list' };
  }
}
