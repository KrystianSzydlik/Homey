import { Product } from '@prisma/client';
import { ProductCallbackData } from '@/types/shopping';

/**
 * Extract product fields into ProductCallbackData format.
 * Eliminates duplicated result.product destructuring/transformation in ProductBottomSheet.
 */
export function extractProductCallback(product: Product): ProductCallbackData {
  return {
    id: product.id,
    name: product.name,
    emoji: product.emoji,
    defaultCategory: product.defaultCategory,
    defaultUnit: product.defaultUnit,
  };
}
