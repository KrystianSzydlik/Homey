import { ShoppingItem } from '@prisma/client';

interface PurchaseStatsUpdate {
  purchaseCount?: number;
  lastPurchasedAt?: Date;
  averageDaysBetweenPurchases?: number;
}

export function calculatePurchaseStats(
  item: ShoppingItem,
  newCheckedState: boolean
): PurchaseStatsUpdate {
  if (!newCheckedState) {
    return {};
  }

  if (item.lastPurchasedAt) {
    const daysSinceLastPurchase =
      (Date.now() - item.lastPurchasedAt.getTime()) / (1000 * 60 * 60 * 24);

    const currentAverage = item.averageDaysBetweenPurchases || 0;
    const newPurchaseCount = item.purchaseCount + 1;

    const newAverage =
      (currentAverage * item.purchaseCount + daysSinceLastPurchase) /
      newPurchaseCount;

    return {
      purchaseCount: newPurchaseCount,
      lastPurchasedAt: new Date(),
      averageDaysBetweenPurchases: newAverage,
    };
  }

  return {
    purchaseCount: 1,
    lastPurchasedAt: new Date(),
    averageDaysBetweenPurchases: 0,
  };
}
