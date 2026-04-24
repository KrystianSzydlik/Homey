'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingCategory } from '@prisma/client';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { updateShoppingItemSchema } from '@/app/lib/validation/shopping-schemas';

interface UpdateShoppingItemInput {
  name?: string;
  quantity?: string;
  unit?: string;
  category?: ShoppingCategory;
  emoji?: string;
  checked?: boolean;
  productId?: string;
}

export async function updateShoppingItem(
  itemId: string,
  input: UpdateShoppingItemInput
): Promise<ShoppingItemActionResult> {
  try {
    const householdId = await getHouseholdId();

    const validatedInput = updateShoppingItemSchema.parse(input);

    const item = await prisma.shoppingItem.findFirst({
      where: { id: itemId, householdId },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    const updateData: Partial<{
      name: string;
      quantity: string;
      unit: string | null;
      category: ShoppingCategory;
      emoji: string | null;
      checked: boolean;
      productId: string;
    }> = {};

    if (validatedInput.name !== undefined)
      updateData.name = validatedInput.name;
    if (validatedInput.quantity !== undefined)
      updateData.quantity = validatedInput.quantity;
    if (validatedInput.unit !== undefined)
      updateData.unit = validatedInput.unit;
    if (validatedInput.category !== undefined)
      updateData.category = validatedInput.category;
    if (validatedInput.emoji !== undefined)
      updateData.emoji = validatedInput.emoji;
    if (validatedInput.checked !== undefined)
      updateData.checked = validatedInput.checked;
    if (validatedInput.productId !== undefined)
      updateData.productId = validatedInput.productId;

    const updatedItem = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: updateData,
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

    return { success: true, item: updatedItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error updating shopping item:', error);
    return { success: false, error: 'Failed to update item' };
  }
}
