import type { Prisma } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import { updateEwa } from '@/lib/purchase-stats';

interface RecordPurchaseInput {
  productId: string;
  shoppingItemId: string;
  quantity: number;
  unit: string | null;
  price?: Decimal | null;
  householdId: string;
  userId: string;
}

export async function recordPurchase(
  tx: Prisma.TransactionClient,
  input: RecordPurchaseInput
): Promise<void> {
  const now = new Date();

  const product = await tx.product.findUnique({
    where: { id: input.productId },
    select: { lastPurchasedAt: true, averageDaysBetweenPurchases: true },
  });

  const newAvgDays =
    product?.lastPurchasedAt != null
      ? updateEwa(product.averageDaysBetweenPurchases, product.lastPurchasedAt, now)
      : null;

  await Promise.all([
    tx.purchaseRecord.create({
      data: {
        productId: input.productId,
        quantity: input.quantity,
        unit: input.unit,
        price: input.price ?? null,
        shoppingItemId: input.shoppingItemId,
        householdId: input.householdId,
        createdById: input.userId,
      },
    }),
    tx.product.update({
      where: { id: input.productId },
      data: {
        purchaseCount: { increment: 1 },
        lastPurchasedAt: now,
        ...(newAvgDays !== null && { averageDaysBetweenPurchases: newAvgDays }),
      },
    }),
  ]);
}
