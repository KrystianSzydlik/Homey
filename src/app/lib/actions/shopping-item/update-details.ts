'use server';

import { z } from 'zod';
import { getSessionData } from '@/app/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { PLN_MAX_VALUE } from '@/lib/pln-validation';
import { validatePlnPrice } from '@/lib/pln-validation.server';
import { ShoppingItem } from '@prisma/client';
import { recordPurchase } from './record-purchase';

const updateItemSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().positive().max(PLN_MAX_VALUE).optional().nullable(),
  checked: z.boolean().optional(),
});

type UpdateItemResult =
  | { success: true; data: ShoppingItem }
  | { success: false; error: string };

export async function updateShoppingItemDetails(
  data: z.infer<typeof updateItemSchema>
): Promise<UpdateItemResult> {
  try {
    const session = await getSessionData();
    const validated = updateItemSchema.parse(data);

    const existing = await prisma.shoppingItem.findUnique({
      where: { id: validated.itemId },
      select: { householdId: true, checked: true },
    });

    if (!existing) {
      return { success: false, error: 'Item not found' };
    }
    if (existing.householdId !== session.householdId) {
      return { success: false, error: 'Unauthorized' };
    }

    const isNewlyChecked = validated.checked === true && !existing.checked;
    const priceDecimal =
      isNewlyChecked && validated.price != null
        ? validatePlnPrice(validated.price, { allowNull: false, autoCorrect: true })
        : null;

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.shoppingItem.update({
        where: { id: validated.itemId },
        data: {
          quantity: validated.quantity,
          unit: validated.unit,
          checked: validated.checked,
        },
      });

      if (isNewlyChecked) {
        await recordPurchase(tx, {
          productId: item.productId,
          shoppingItemId: item.id,
          quantity: parseFloat(item.quantity) || 1,
          unit: item.unit,
          price: priceDecimal,
          householdId: session.householdId,
          userId: session.userId,
        });
      }

      return item;
    });

    return { success: true, data: updated };
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
