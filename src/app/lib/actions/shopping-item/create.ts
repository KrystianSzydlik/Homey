'use server';

import { prisma } from '@/lib/prisma';
import { serializeDecimals } from '@/lib/serializers';
import { ShoppingCategory } from '@prisma/client';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getSessionData } from '@/app/lib/auth-utils';
import { createShoppingItemSchema } from '@/app/lib/validation/shopping-schemas';

interface CreateShoppingItemInput {
  name: string;
  quantity?: string;
  unit?: string;
  category?: ShoppingCategory;
  emoji?: string;
  shoppingListId: string;
  productId: string;
}

export async function createShoppingItem(
  input: CreateShoppingItemInput
): Promise<ShoppingItemActionResult> {
  try {
    const { householdId, userId } = await getSessionData();

    const validatedInput = createShoppingItemSchema.parse(input);

    const shoppingList = await prisma.shoppingList.findFirst({
      where: { id: validatedInput.shoppingListId, householdId },
    });

    if (!shoppingList) {
      return { success: false, error: 'Shopping list not found' };
    }

    const maxPosition = await prisma.shoppingItem.findFirst({
      where: { shoppingListId: validatedInput.shoppingListId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (maxPosition?.position ?? -1) + 1;

    const item = await prisma.shoppingItem.create({
      data: {
        name: validatedInput.name,
        quantity: validatedInput.quantity || '1',
        unit: validatedInput.unit,
        category: validatedInput.category || 'OTHER',
        emoji: validatedInput.emoji,
        position: nextPosition,
        shoppingListId: validatedInput.shoppingListId,
        productId: validatedInput.productId,
        householdId,
        createdById: userId,
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

    return { success: true, item: serializeDecimals(item) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error creating shopping item:', error);
    return { success: false, error: 'Failed to create item' };
  }
}
