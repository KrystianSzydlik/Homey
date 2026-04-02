'use server';

import { z } from 'zod';
import { getSessionData } from '@/app/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { serializeDecimals } from '@/lib/serializers';
import { PLN_MAX_VALUE } from '@/lib/pln-validation';
import { validatePlnPrice } from '@/lib/pln-validation.server';
import { Decimal } from '@prisma/client/runtime/library';
import { ShoppingItem } from '@prisma/client';
import { SerializedShoppingItem } from '@/types/shopping';

const updateItemSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().positive().max(PLN_MAX_VALUE).optional().nullable(),
  checked: z.boolean().optional(),
});

type UpdateItemResult =
  | { success: true; data: SerializedShoppingItem }
  | { success: false; error: string };

export async function updateShoppingItemDetails(
  data: z.infer<typeof updateItemSchema>
): Promise<UpdateItemResult> {
  try {
    const session = await getSessionData();
    const validated = updateItemSchema.parse(data);

    const item = await prisma.shoppingItem.findUnique({
      where: { id: validated.itemId },
      select: { householdId: true, checked: true },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }
    if (item.householdId !== session.householdId) {
      return { success: false, error: 'Unauthorized' };
    }

    let priceDecimal: Decimal | null | undefined;
    if (validated.price !== undefined) {
      priceDecimal = validated.price !== null
        ? validatePlnPrice(validated.price, { allowNull: false, autoCorrect: true })
        : null;
    }

    const updateData: {
      quantity?: string;
      unit?: string;
      price?: Decimal | null;
      checked?: boolean;
      purchasedAt?: Date | null;
    } = {
      quantity: validated.quantity,
      unit: validated.unit,
      checked: validated.checked,
    };

    if (priceDecimal !== undefined) {
      updateData.price = priceDecimal;
    }

    if (validated.checked && !item.checked) {
      updateData.purchasedAt = new Date();
    }

    if (validated.checked === false && item.checked) {
      updateData.purchasedAt = null;
    }

    const updated: ShoppingItem = await prisma.shoppingItem.update({
      where: { id: validated.itemId },
      data: updateData,
    });

    return { success: true, data: serializeDecimals(updated) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error updating shopping item details:', error);
    return { success: false, error: 'Failed to update item' };
  }
}
