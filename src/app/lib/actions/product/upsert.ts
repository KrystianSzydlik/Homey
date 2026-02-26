'use server';

import { prisma } from '@/lib/prisma';
import { ProductActionResult } from '@/types/shopping';
import { ShoppingCategory } from '@prisma/client';
import { z } from 'zod';
import { getSessionData } from '@/app/lib/auth-utils';
import { createProductSchema } from '@/app/lib/validation/shopping-schemas';
import { updateProduct } from './update';

interface CreateProductInput {
  name: string;
  emoji?: string;
  defaultCategory?: ShoppingCategory;
  defaultUnit?: string;
}

export async function upsertProduct(
  input: CreateProductInput
): Promise<ProductActionResult> {
  try {
    const { householdId, userId } = await getSessionData();

    const validatedInput = createProductSchema.parse(input);

    const existingProduct = await prisma.product.findUnique({
      where: {
        name_householdId: {
          name: validatedInput.name,
          householdId,
        },
      },
    });

    if (existingProduct) {
      return updateProduct(existingProduct.id, validatedInput);
    } else {
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
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error in upsertProduct:', error);
    return { success: false, error: 'Failed to upsert product' };
  }
}
