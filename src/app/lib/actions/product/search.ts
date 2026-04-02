'use server';

import { prisma } from '@/lib/prisma';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { searchQuerySchema } from '@/app/lib/validation/shopping-schemas';

export async function searchProducts(query: string) {
  try {
    const householdId = await getHouseholdId();

    const validatedQuery = searchQuerySchema.parse(query);

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: validatedQuery,
          mode: 'insensitive',
        },
        OR: [{ householdId }, { householdId: null }],
      },
      take: 10,
    });

    return { success: true, products };
  } catch (error) {
    console.error('Error searching products:', error);
    return { success: false, error: 'Failed to search products' };
  }
}
