'use server';

import { prisma } from '@/lib/prisma';
import { ProductSuggestion } from '@/types/shopping';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { searchQuerySchema } from '@/app/lib/validation/shopping-schemas';

export async function getProductSuggestions(
  query: string
): Promise<ProductSuggestion[]> {
  try {
    const householdId = await getHouseholdId();

    const validatedQuery = searchQuerySchema.parse(query);

    const [catalogProducts, recentProducts] = await Promise.all([
      prisma.product.findMany({
        where: {
          name: {
            contains: validatedQuery,
            mode: 'insensitive',
          },
          OR: [{ householdId }, { householdId: null }],
        },
        take: 5,
      }),

      prisma.product.findMany({
        where: {
          householdId,
          name: {
            contains: validatedQuery,
            mode: 'insensitive',
          },
          purchaseCount: { gt: 0 },
        },
        take: 5,
        orderBy: { lastPurchasedAt: 'desc' },
      }),
    ]);

    const catalogSuggestions: ProductSuggestion[] = catalogProducts.map(
      (product, index) => ({
        id: product.id,
        name: product.name,
        emoji: product.emoji,
        category: product.defaultCategory,
        defaultUnit: product.defaultUnit,
        score: 1 - index * 0.1,
        source: 'catalog',
      })
    );

    const recentSuggestions: ProductSuggestion[] = recentProducts.map(
      (product, index) => ({
        name: product.name,
        emoji: product.emoji,
        category: product.defaultCategory,
        defaultUnit: product.defaultUnit,
        score: 0.8 - index * 0.1,
        source: 'history',
      })
    );

    const allSuggestions = [...catalogSuggestions, ...recentSuggestions];
    const uniqueSuggestions = Array.from(
      allSuggestions
        .reduce((map, suggestion) => {
          const existing = map.get(suggestion.name);
          if (!existing || suggestion.score > existing.score) {
            map.set(suggestion.name, suggestion);
          }
          return map;
        }, new Map<string, ProductSuggestion>())
        .values()
    );

    return uniqueSuggestions.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    console.error('Error getting product suggestions:', error);
    return [];
  }
}
