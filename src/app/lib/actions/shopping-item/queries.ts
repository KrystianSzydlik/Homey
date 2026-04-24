'use server';

import { prisma } from '@/lib/prisma';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { getPurchasePricesByItemId } from './helpers/purchase-prices';

export async function getShoppingItems() {
  try {
    const householdId = await getHouseholdId();

    const items = await prisma.shoppingItem.findMany({
      where: { householdId },
      orderBy: { position: 'asc' },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    const checkedIds = items.filter((i) => i.checked).map((i) => i.id);
    const priceMap = await getPurchasePricesByItemId(checkedIds);

    const enrichedItems = items.map((item) => ({
      ...item,
      purchasePrice: item.checked ? (priceMap.get(item.id) ?? null) : null,
    }));

    return { success: true, items: enrichedItems };
  } catch (error) {
    console.error('Error fetching shopping items:', error);
    return { success: false, error: 'Failed to fetch items' };
  }
}
