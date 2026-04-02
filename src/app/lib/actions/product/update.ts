'use server';

import { prisma } from '@/lib/prisma';
import { ProductActionResult } from '@/types/shopping';
import { ShoppingCategory } from '@prisma/client';
import { getHouseholdId } from '@/app/lib/auth-utils';

interface UpdateProductInput {
  name?: string;
  emoji?: string;
  defaultCategory?: ShoppingCategory;
  defaultUnit?: string;
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput
): Promise<ProductActionResult> {
  try {
    const householdId = await getHouseholdId();

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
    if (input.defaultCategory !== undefined)
      updateData.defaultCategory = input.defaultCategory;
    if (input.defaultUnit !== undefined)
      updateData.defaultUnit = input.defaultUnit;

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
