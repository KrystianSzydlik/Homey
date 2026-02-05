'use server';

import { z } from 'zod';
import { getSessionData } from '@/app/lib/auth-utils';
import { prisma } from '@/lib/prisma';

const updateItemSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().positive().max(999999.99).optional().nullable(),
  checked: z.boolean().optional(),
});

export async function updateShoppingItem(
  data: z.infer<typeof updateItemSchema>
) {
  const session = await getSessionData();
  const validated = updateItemSchema.parse(data);

  // 1. Verify ownership (multi-tenant isolation)
  const item = await prisma.shoppingItem.findUnique({
    where: { id: validated.itemId },
    select: { householdId: true, checked: true },
  });

  if (!item) throw new Error('Item not found');
  if (item.householdId !== session.householdId) {
    // Note: session structure from auth-utils usually has householdId directly or checks it
    throw new Error('Unauthorized');
  }

  // 2. Prepare update data
  const updateData: {
    quantity?: string;
    unit?: string;
    price?: number | null;
    checked?: boolean;
    purchasedAt?: Date | null;
  } = {
    quantity: validated.quantity,
    unit: validated.unit,
    price: validated.price,
    checked: validated.checked,
  };

  // 3. Set purchasedAt when marking as checked
  if (validated.checked && !item.checked) {
    updateData.purchasedAt = new Date();
  }

  // 4. Clear purchasedAt when unchecking
  if (validated.checked === false && item.checked) {
    updateData.purchasedAt = null;
  }

  // 5. Update
  const updated = await prisma.shoppingItem.update({
    where: { id: validated.itemId },
    data: updateData,
  });

  return { success: true, data: updated };
}
