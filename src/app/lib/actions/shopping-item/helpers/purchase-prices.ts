import { prisma } from '@/lib/prisma';
import { PLN_DECIMAL_PLACES } from '@/lib/pln-validation';

export async function getPurchasePricesByItemId(
  itemIds: string[]
): Promise<Map<string, number | null>> {
  const priceMap = new Map<string, number | null>();
  if (itemIds.length === 0) return priceMap;

  const records = await prisma.purchaseRecord.findMany({
    where: { shoppingItemId: { in: itemIds } },
    select: { shoppingItemId: true, price: true },
    orderBy: { purchasedAt: 'desc' },
  });

  for (const record of records) {
    if (!record.shoppingItemId || priceMap.has(record.shoppingItemId)) continue;
    priceMap.set(
      record.shoppingItemId,
      record.price != null
        ? Number(record.price.toFixed(PLN_DECIMAL_PLACES))
        : null
    );
  }

  return priceMap;
}
