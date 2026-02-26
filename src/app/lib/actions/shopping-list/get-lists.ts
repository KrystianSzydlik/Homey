'use server';

import { prisma } from '@/lib/prisma';
import { serializeDecimals } from '@/lib/serializers';
import { ShoppingListWithItems } from '@/types/shopping';
import { getHouseholdId } from '@/app/lib/auth-utils';

interface GetShoppingListsResult {
  success: boolean;
  lists?: ShoppingListWithItems[];
  error?: string;
}

export async function getShoppingLists(): Promise<GetShoppingListsResult> {
  try {
    const householdId = await getHouseholdId();

    const lists = await prisma.shoppingList.findMany({
      where: { householdId },
      orderBy: { position: 'asc' },
      include: {
        items: {
          orderBy: { position: 'asc' },
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
        },
        createdBy: {
          select: { name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return { success: true, lists: serializeDecimals(lists) };
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return { success: false, error: 'Failed to fetch lists' };
  }
}
