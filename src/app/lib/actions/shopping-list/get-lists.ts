'use server';

import { prisma } from '@/lib/prisma';
import { ShoppingListWithItems } from '@/types/shopping';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { getPurchasePricesByItemId } from '@/app/lib/actions/shopping-item/helpers/purchase-prices';

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

    const checkedIds = lists.flatMap((l) =>
      l.items.filter((i) => i.checked).map((i) => i.id)
    );
    const priceMap = await getPurchasePricesByItemId(checkedIds);

    const enrichedLists = lists.map((list) => ({
      ...list,
      items: list.items.map((item) => ({
        ...item,
        purchasePrice: item.checked ? (priceMap.get(item.id) ?? null) : null,
      })),
    }));

    return { success: true, lists: enrichedLists };
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return { success: false, error: 'Failed to fetch lists' };
  }
}
