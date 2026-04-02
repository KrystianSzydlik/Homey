import { Product } from '@prisma/client';
import { ProductCallbackData } from '@/types/shopping';

export function extractProductCallback(product: Product): ProductCallbackData {
  return {
    id: product.id,
    name: product.name,
    emoji: product.emoji,
    defaultCategory: product.defaultCategory,
    defaultUnit: product.defaultUnit,
  };
}
