'use server';

import { prisma } from '@/lib/prisma';
import { getHouseholdId } from '@/app/lib/auth-utils';

export async function incrementProductUsage(productId: string): Promise<void> {
  try {
    const householdId = await getHouseholdId();

    const product = await prisma.product.findFirst({
      where: { id: productId, householdId },
    });

    if (!product) return;

    await prisma.product.update({
      where: { id: productId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error incrementing product usage:', error);
  }
}
