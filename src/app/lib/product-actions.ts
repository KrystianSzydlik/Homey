'use server';

import { prisma } from '@/lib/prisma';
import {
  ProductActionResult,
  ProductSuggestion,
  HistorySuggestion,
} from '@/types/shopping';
import { ShoppingCategory } from '@prisma/client';
import { z } from 'zod';
import { getHouseholdId, getSessionData } from './auth-utils';
import { createProductSchema, searchQuerySchema } from './validation/shopping-schemas';

interface CreateProductInput {
  name: string;
  emoji?: string;
  defaultCategory?: ShoppingCategory;
  defaultUnit?: string;
}

interface UpdateProductInput {
  name?: string;
  emoji?: string;
  defaultCategory?: ShoppingCategory;
  defaultUnit?: string;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<ProductActionResult> {
  try {
    const { householdId, userId } = await getSessionData();

    const validatedInput = createProductSchema.parse(input);

    // Check if product already exists for this household
    const existingProduct = await prisma.product.findUnique({
      where: {
        name_householdId: {
          name: validatedInput.name,
          householdId,
        },
      },
    });

    if (existingProduct) {
      return { success: false, error: 'Product already exists' };
    }

    const product = await prisma.product.create({
      data: {
        name: validatedInput.name,
        emoji: validatedInput.emoji,
        defaultCategory: validatedInput.defaultCategory || 'OTHER',
        defaultUnit: validatedInput.defaultUnit,
        householdId,
        createdById: userId,
      },
    });

    return { success: true, product };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error creating product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput,
): Promise<ProductActionResult> {
  try {
    const householdId = await getHouseholdId();

    // Only allow updating household-specific products
    const product = await prisma.product.findFirst({
      where: { id: productId, householdId },
    });

    if (!product) {
      return { success: false, error: 'Product not found or access denied' };
    }

    const updateData: Partial<{
      name: string;
      emoji: string | null;
      defaultCategory: ShoppingCategory;
      defaultUnit: string | null;
    }> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.emoji !== undefined) updateData.emoji = input.emoji;
    if (input.defaultCategory !== undefined) updateData.defaultCategory = input.defaultCategory;
    if (input.defaultUnit !== undefined) updateData.defaultUnit = input.defaultUnit;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(productId: string): Promise<ProductActionResult> {
  try {
    const householdId = await getHouseholdId();

    // Only allow deleting household-specific products
    const product = await prisma.product.findFirst({
      where: { id: productId, householdId },
    });

    if (!product) {
      return { success: false, error: 'Product not found or access denied' };
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function searchProducts(query: string) {
  try {
    const householdId = await getHouseholdId();

    const validatedQuery = searchQuerySchema.parse(query);

    // Search in both household-specific and global products
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

export async function getProductSuggestions(query: string): Promise<ProductSuggestion[]> {
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

    const catalogSuggestions: ProductSuggestion[] = catalogProducts.map((product, index) => ({
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      category: product.defaultCategory,
      defaultUnit: product.defaultUnit,
      score: 1 - index * 0.1, // Prefer earlier results
      source: 'catalog',
    }));

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

    const recentSuggestions: ProductSuggestion[] = recentItems.map((item, index) => ({
      name: item.name,
      emoji: item.emoji,
      category: item.category,
      defaultUnit: item.unit,
      score: 0.8 - index * 0.1,
      source: 'history',
    }));

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
        if (!item.lastPurchasedAt || !item.averageDaysBetweenPurchases) return null;

        const daysSinceLastPurchase =
          (Date.now() - item.lastPurchasedAt.getTime()) / (1000 * 60 * 60 * 24);
        const urgencyScore =
          daysSinceLastPurchase / item.averageDaysBetweenPurchases;

        return {
          name: item.name,
          emoji: item.emoji,
          category: item.category,
          defaultUnit: item.unit,
          score: Math.min(urgencyScore * 0.5, 0.7), // Cap at 0.7
          source: 'smart' as const,
        } satisfies HistorySuggestion;
      })
      .filter(Boolean) as ProductSuggestion[];

    // Combine and deduplicate by name, keeping highest score
    const allSuggestions = [...catalogSuggestions, ...recentSuggestions, ...smartSuggestionsFormatted];
    const uniqueSuggestions = Array.from(
      allSuggestions
        .reduce((map, suggestion) => {
          const existing = map.get(suggestion.name);
          if (!existing || suggestion.score > existing.score) {
            map.set(suggestion.name, suggestion);
          }
          return map;
        }, new Map<string, ProductSuggestion>())
        .values(),
    );

    // Sort by score descending
    return uniqueSuggestions.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    console.error('Error getting product suggestions:', error);
    return [];
  }
}

export async function incrementProductUsage(productId: string): Promise<void> {
  try {
    const householdId = await getHouseholdId();

    // Verify product belongs to household
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
