'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionData } from '@/app/lib/auth-utils';
import { ShoppingItem } from '@prisma/client';

const addToListSchema = z.object({
  productId: z.string().cuid(),
  listId: z.string().cuid(),
});

type AddToListResult =
  | { success: true; data: ShoppingItem }
  | { success: false; error: string; reason?: 'already_on_list' };

export async function addProductToList(
  input: z.infer<typeof addToListSchema>
): Promise<AddToListResult> {
  try {
    const session = await getSessionData();
    const { productId, listId } = addToListSchema.parse(input);

    const [list, product] = await Promise.all([
      prisma.shoppingList.findFirst({
        where: { id: listId, householdId: session.householdId },
      }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!list) return { success: false, error: 'List not found' };
    if (!product) return { success: false, error: 'Product not found' };

    const existing = await prisma.shoppingItem.findFirst({
      where: { productId, shoppingListId: listId, checked: false },
    });
    if (existing) return { success: false, error: 'Already on list', reason: 'already_on_list' };

    const maxPosition = await prisma.shoppingItem.findFirst({
      where: { shoppingListId: listId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const item = await prisma.shoppingItem.create({
      data: {
        name: product.name,
        emoji: product.emoji,
        category: product.defaultCategory,
        unit: product.defaultUnit,
        position: (maxPosition?.position ?? -1) + 1,
        productId,
        shoppingListId: listId,
        householdId: session.householdId,
        createdById: session.userId,
      },
    });

    return { success: true, data: item };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error adding product to list:', error);
    return { success: false, error: 'Failed to add item' };
  }
}
