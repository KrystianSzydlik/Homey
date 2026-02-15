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

interface UpdateItemResult {
  success: true;
  data: SerializedShoppingItem;
}

export async function updateShoppingItemDetails(
  data: z.infer<typeof updateItemSchema>
): Promise<UpdateItemResult> {
  const session = await getSessionData();
  const validated = updateItemSchema.parse(data);

  // 1. Verify ownership (multi-tenant isolation)
  const item = await prisma.shoppingItem.findUnique({
    where: { id: validated.itemId },
    select: { householdId: true, checked: true },
  });

  if (!item) throw new Error('Item not found');
  if (item.householdId !== session.householdId) {
    throw new Error('Unauthorized');
  }

  // 2. Validate and convert price to Decimal for Prisma
  let priceDecimal: Decimal | null | undefined;
  if (validated.price !== undefined) {
    priceDecimal = validated.price !== null
      ? validatePlnPrice(validated.price, { allowNull: false, autoCorrect: true })
      : null;
  }

  // 3. Prepare update data
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

  // 4. Set purchasedAt when marking as checked
  if (validated.checked && !item.checked) {
    updateData.purchasedAt = new Date();
  }

  // 5. Clear purchasedAt when unchecking
  if (validated.checked === false && item.checked) {
    updateData.purchasedAt = null;
  }

  // 6. Update
  const updated: ShoppingItem = await prisma.shoppingItem.update({
    where: { id: validated.itemId },
    data: updateData,
  });

  return { success: true, data: serializeDecimals(updated) };
}
