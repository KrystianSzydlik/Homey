'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingListActionResult } from '@/types/shopping';
import { z } from 'zod';
import { getSessionData } from '@/app/lib/auth-utils';
import { createShoppingListSchema } from '@/app/lib/validation/shopping-schemas';

interface CreateShoppingListInput {
  name: string;
  emoji?: string;
  color?: string;
}

export async function createShoppingList(
  input: CreateShoppingListInput
): Promise<ShoppingListActionResult> {
  try {
    const { householdId, userId } = await getSessionData();

    const validatedInput = createShoppingListSchema.parse(input);

    const maxPosition = await prisma.shoppingList.findFirst({
      where: { householdId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (maxPosition?.position ?? -1) + 1;

    const list = await prisma.shoppingList.create({
      data: {
        name: validatedInput.name,
        emoji: validatedInput.emoji,
        color: validatedInput.color,
        position: nextPosition,
        householdId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return { success: true, list };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error creating shopping list:', error);
    return { success: false, error: 'Failed to create list' };
  }
}
