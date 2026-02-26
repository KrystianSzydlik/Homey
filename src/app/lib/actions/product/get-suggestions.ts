'use server';

import { prisma } from '@/lib/prisma';
import {
  ProductSuggestion,
  HistorySuggestion,
} from '@/types/shopping';
import { getHouseholdId } from '@/app/lib/auth-utils';
import { searchQuerySchema } from '@/app/lib/validation/shopping-schemas';

export async function getProductSuggestions(
  query: string
): Promise<ProductSuggestion[]> {
  try {
    const householdId = await getHouseholdId();

    const validatedQuery = searchQuerySchema.parse(query);

    // Search catalog products (household-specific and global)
    const catalogProducts = await prisma.product.findMany({
      where: {
        name: {
          contains: validatedQuery,
          mode: 'insensitive',
        },
        OR: [{ householdId }, { householdId: null }],
      },
      take: 5,
    });

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

    // Search recent items from purchase history
    const recentItems = await prisma.shoppingItem.findMany({
      where: {
        householdId,
        name: {
          contains: validatedQuery,
          mode: 'insensitive',
        },
        purchaseCount: { gt: 0 },
      },
      distinct: ['name'],
      take: 5,
      orderBy: { lastPurchasedAt: 'desc' },
    });

    const recentSuggestions: ProductSuggestion[] = recentItems.map(
      (item, index) => ({
        name: item.name,
        emoji: item.emoji,
        category: item.category,
        defaultUnit: item.unit,
        score: 0.8 - index * 0.1,
        source: 'history',
      })
    );

    // Get smart suggestions (items due for repurchase)
    const smartSuggestions = await prisma.shoppingItem.findMany({
      where: {
        householdId,
        name: {
          contains: validatedQuery,
          mode: 'insensitive',
        },
        purchaseCount: { gt: 0 },
        lastPurchasedAt: { not: null },
        averageDaysBetweenPurchases: { not: null },
      },
      take: 5,
    });

    const smartSuggestionsFormatted: ProductSuggestion[] = smartSuggestions
      .map((item) => {
        if (!item.lastPurchasedAt || !item.averageDaysBetweenPurchases)
          return null;

        const daysSinceLastPurchase =
          (Date.now() - item.lastPurchasedAt.getTime()) / (1000 * 60 * 60 * 24);
        const urgencyScore =
          daysSinceLastPurchase / item.averageDaysBetweenPurchases;

        return {
          name: item.name,
          emoji: item.emoji,
          category: item.category,
          defaultUnit: item.unit,
          score: Math.min(urgencyScore * 0.5, 0.7),
          source: 'smart' as const,
        } satisfies HistorySuggestion;
      })
      .filter(Boolean) as ProductSuggestion[];

    // Combine and deduplicate by name, keeping highest score
    const allSuggestions = [
      ...catalogSuggestions,
      ...recentSuggestions,
      ...smartSuggestionsFormatted,
    ];
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
