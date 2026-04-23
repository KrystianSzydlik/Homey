'use server';

import { prisma } from '@/lib/prisma';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { ShoppingCategory } from '@prisma/client';

const SMART_THRESHOLD = 0.85;

export interface SmartReminder {
  id: string;
  name: string;
  emoji: string | null;
  defaultCategory: ShoppingCategory;
  defaultUnit: string | null;
  daysSince: number;
  averageDays: number;
  overdueRatio: number;
}

export async function getSmartReminders(listId?: string): Promise<SmartReminder[]> {
  try {
    const householdId = await getHouseholdId();
    const now = Date.now();

    const [candidates, activeItems] = await Promise.all([
      prisma.product.findMany({
        where: {
          householdId,
          purchaseCount: { gte: 2 },
          lastPurchasedAt: { not: null },
          averageDaysBetweenPurchases: { not: null },
        },
        select: {
          id: true,
          name: true,
          emoji: true,
          defaultCategory: true,
          defaultUnit: true,
          lastPurchasedAt: true,
          averageDaysBetweenPurchases: true,
        },
      }),
      listId
        ? prisma.shoppingItem.findMany({
            where: { shoppingListId: listId, checked: false },
            select: { productId: true },
          })
        : Promise.resolve([] as { productId: string }[]),
    ]);

    const onListIds = new Set(activeItems.map((i) => i.productId));

    return candidates
      .filter((p) => {
        if (onListIds.has(p.id)) return false;
        const daysSince = (now - p.lastPurchasedAt!.getTime()) / 86_400_000;
        return daysSince >= p.averageDaysBetweenPurchases! * SMART_THRESHOLD;
      })
      .map((p) => {
        const daysSince = (now - p.lastPurchasedAt!.getTime()) / 86_400_000;
        const averageDays = p.averageDaysBetweenPurchases!;
        return {
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          defaultCategory: p.defaultCategory,
          defaultUnit: p.defaultUnit,
          daysSince,
          averageDays,
          overdueRatio: daysSince / averageDays,
        };
      })
      .sort((a, b) => b.overdueRatio - a.overdueRatio);
  } catch (error) {
    console.error('Error getting smart reminders:', error);
    return [];
  }
}
