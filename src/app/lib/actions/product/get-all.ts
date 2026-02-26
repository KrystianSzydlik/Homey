'use server';

import { prisma } from '@/lib/prisma';
import { CatalogSuggestion } from '@/types/shopping';
import { getHouseholdId } from '@/app/lib/auth-utils';

/**
 * Fetch all products for client-side caching.
 * Returns catalog products for instant autocomplete.
 */
export async function getAllProducts(): Promise<CatalogSuggestion[]> {
  try {
    const householdId = await getHouseholdId();

    const products = await prisma.product.findMany({
      where: {
        OR: [{ householdId }, { householdId: null }],
      },
      orderBy: [
        { usageCount: 'desc' },
        { lastUsedAt: 'desc' },
        { name: 'asc' },
      ],
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      category: product.defaultCategory,
      defaultUnit: product.defaultUnit,
      score: 1,
      source: 'catalog' as const,
    }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}
