'use server';

import { prisma } from '@/lib/prisma';
import { ProductActionResult } from '@/types/shopping';
import { getHouseholdId } from '@/app/lib/auth-utils';

export async function deleteProduct(
  productId: string
): Promise<ProductActionResult> {
  try {
    const householdId = await getHouseholdId();

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
