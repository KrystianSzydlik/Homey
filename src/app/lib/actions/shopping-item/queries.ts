'use server';

import { prisma } from '@/lib/prisma';
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

    return { success: true, items };
  } catch (error) {
    console.error('Error fetching shopping items:', error);
    return { success: false, error: 'Failed to fetch items' };
  }
}
