'use server';

import { prisma } from '@/lib/prisma';
import { serializeDecimals } from '@/lib/serializers';
import { getHouseholdId } from '@/app/lib/auth-utils';

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

    return { success: true, items: serializeDecimals(items) };
  } catch (error) {
    console.error('Error fetching shopping items:', error);
    return { success: false, error: 'Failed to fetch items' };
  }
}

export async function getSuggestedItems() {
  try {
    const householdId = await getHouseholdId();

    const items = await prisma.shoppingItem.findMany({
      where: {
        householdId,
        purchaseCount: { gt: 0 },
        lastPurchasedAt: { not: null },
        checked: false,
      },
      orderBy: { lastPurchasedAt: 'asc' },
      take: 10,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    const suggestedItems = items
      .map((item) => {
        if (!item.lastPurchasedAt || !item.averageDaysBetweenPurchases) {
          return null;
        }

        const daysSinceLastPurchase =
          (Date.now() - item.lastPurchasedAt.getTime()) / (1000 * 60 * 60 * 24);
        const urgencyScore =
          daysSinceLastPurchase / item.averageDaysBetweenPurchases;

        return {
          ...item,
          urgencyScore,
        };
      })
      .filter(
        (
          item
        ): item is Exclude<(typeof items)[number], null> & {
          urgencyScore: number;
        } => item !== null && item.urgencyScore > 1
      )
      .sort((a, b) => b.urgencyScore - a.urgencyScore);

    return { success: true, items: serializeDecimals(suggestedItems) };
  } catch (error) {
    console.error('Error fetching suggested items:', error);
    return { success: false, error: 'Failed to fetch suggestions' };
  }
}
