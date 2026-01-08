'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ShoppingCategory } from '@prisma/client';
import { redirect } from 'next/navigation';
import { ShoppingItemActionResult } from '@/types/shopping';
import { z } from 'zod';

interface CreateShoppingItemInput {
  name: string;
  quantity?: string;
  unit?: string;
  category?: ShoppingCategory;
  emoji?: string;
}

interface UpdateShoppingItemInput {
  name?: string;
  quantity?: string;
  unit?: string;
  category?: ShoppingCategory;
  emoji?: string;
  checked?: boolean;
}

const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  quantity: z.string().max(20).optional(),
  unit: z.string().max(20).optional(),
  category: z.nativeEnum(ShoppingCategory).optional(),
  emoji: z.string().max(10).optional(),
});

const updateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  quantity: z.string().max(20).optional(),
  unit: z.string().max(20).optional(),
  category: z.nativeEnum(ShoppingCategory).optional(),
  emoji: z.string().max(10).optional(),
  checked: z.boolean().optional(),
});

async function getHouseholdId() {
  const session = await auth();
  if (!session?.user?.householdId) {
    redirect('/login');
  }
  return session.user.householdId;
}

export async function createShoppingItem(
  input: CreateShoppingItemInput,
): Promise<ShoppingItemActionResult> {
  try {
    const householdId = await getHouseholdId();
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Validate input
    const validatedInput = createItemSchema.parse(input);

    // Get max position for ordering
    const maxPosition = await prisma.shoppingItem.findFirst({
      where: { householdId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (maxPosition?.position ?? -1) + 1;

    const item = await prisma.shoppingItem.create({
      data: {
        name: validatedInput.name,
        quantity: validatedInput.quantity || '1',
        unit: validatedInput.unit,
        category: validatedInput.category || 'OTHER',
        emoji: validatedInput.emoji,
        position: nextPosition,
        householdId,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    return { success: true, item };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error creating shopping item:', error);
    return { success: false, error: 'Failed to create item' };
  }
}

export async function updateShoppingItem(
  itemId: string,
  input: UpdateShoppingItemInput,
): Promise<ShoppingItemActionResult> {
  try {
    const householdId = await getHouseholdId();

    // Validate input
    const validatedInput = updateItemSchema.parse(input);

    // Verify item belongs to household
    const item = await prisma.shoppingItem.findFirst({
      where: { id: itemId, householdId },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Build update data - use !== undefined to allow empty string/falsy values
    const updateData: Record<string, any> = {};

    if (validatedInput.name !== undefined) updateData.name = validatedInput.name;
    if (validatedInput.quantity !== undefined) updateData.quantity = validatedInput.quantity;
    if (validatedInput.unit !== undefined) updateData.unit = validatedInput.unit;
    if (validatedInput.category !== undefined) updateData.category = validatedInput.category;
    if (validatedInput.emoji !== undefined) updateData.emoji = validatedInput.emoji;
    if (validatedInput.checked !== undefined) updateData.checked = validatedInput.checked;

    const updatedItem = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    return { success: true, item: updatedItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    console.error('Error updating shopping item:', error);
    return { success: false, error: 'Failed to update item' };
  }
}

export async function deleteShoppingItem(
  itemId: string,
): Promise<ShoppingItemActionResult> {
  try {
    const householdId = await getHouseholdId();

    // Verify item belongs to household
    const item = await prisma.shoppingItem.findFirst({
      where: { id: itemId, householdId },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    await prisma.shoppingItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting shopping item:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}

export async function toggleShoppingItemChecked(
  itemId: string,
): Promise<ShoppingItemActionResult> {
  try {
    const householdId = await getHouseholdId();

    // Verify item belongs to household
    const item = await prisma.shoppingItem.findFirst({
      where: { id: itemId, householdId },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    const newCheckedState = !item.checked;

    // Update statistics if marking as purchased
    let updateData: any = { checked: newCheckedState };

    if (newCheckedState && item.lastPurchasedAt) {
      const daysSinceLastPurchase =
        (Date.now() - item.lastPurchasedAt.getTime()) / (1000 * 60 * 60 * 24);

      const currentAverage = item.averageDaysBetweenPurchases || 0;
      const newPurchaseCount = item.purchaseCount + 1;

      // Simple moving average
      const newAverage =
        (currentAverage * item.purchaseCount + daysSinceLastPurchase) /
        newPurchaseCount;

      updateData = {
        ...updateData,
        purchaseCount: newPurchaseCount,
        lastPurchasedAt: new Date(),
        averageDaysBetweenPurchases: newAverage,
      };
    } else if (newCheckedState) {
      // First purchase
      updateData = {
        ...updateData,
        purchaseCount: 1,
        lastPurchasedAt: new Date(),
        averageDaysBetweenPurchases: 0,
      };
    }

    const updatedItem = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    return { success: true, item: updatedItem };
  } catch (error) {
    console.error('Error toggling shopping item:', error);
    return { success: false, error: 'Failed to toggle item' };
  }
}

export async function clearCheckedItems(): Promise<ShoppingItemActionResult> {
  try {
    const householdId = await getHouseholdId();

    const result = await prisma.shoppingItem.deleteMany({
      where: {
        householdId,
        checked: true,
      },
    });

    return { success: true, deletedCount: result.count };
  } catch (error) {
    console.error('Error clearing checked items:', error);
    return { success: false, error: 'Failed to clear items' };
  }
}

export async function reorderShoppingItems(
  itemIds: string[],
): Promise<ShoppingItemActionResult> {
  try {
    const householdId = await getHouseholdId();

    // Verify all items belong to household
    const items = await prisma.shoppingItem.findMany({
      where: { householdId, id: { in: itemIds } },
    });

    if (items.length !== itemIds.length) {
      return { success: false, error: 'Some items not found' };
    }

    // Update position for each item
    const updatePromises = itemIds.map((id, index) =>
      prisma.shoppingItem.update({
        where: { id },
        data: { position: index },
      }),
    );

    await Promise.all(updatePromises);

    return { success: true };
  } catch (error) {
    console.error('Error reordering shopping items:', error);
    return { success: false, error: 'Failed to reorder items' };
  }
}

export async function getShoppingItems() {
  try {
    const householdId = await getHouseholdId();

    const items = await prisma.shoppingItem.findMany({
      where: { householdId },
      orderBy: { position: 'asc' },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    return { success: true, items };
  } catch (error) {
    console.error('Error fetching shopping items:', error);
    return { success: false, error: 'Failed to fetch items' };
  }
}

export async function getSuggestedItems() {
  try {
    const householdId = await getHouseholdId();

    // Get items with purchase history, sorted by urgency
    const items = await prisma.shoppingItem.findMany({
      where: {
        householdId,
        purchaseCount: { gt: 0 },
        lastPurchasedAt: { not: null },
        checked: false,
      },
      orderBy: { lastPurchasedAt: 'asc' },
      take: 10,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    // Calculate urgency score for each item
    const suggestedItems = items
      .map((item) => {
        if (!item.lastPurchasedAt || !item.averageDaysBetweenPurchases) {
          return null;
        }

        const daysSinceLastPurchase =
          (Date.now() - item.lastPurchasedAt.getTime()) / (1000 * 60 * 60 * 24);
        const urgencyScore =
          daysSinceLastPurchase / item.averageDaysBetweenPurchases;

        return {
          ...item,
          urgencyScore,
        };
      })
      .filter((item): item is Exclude<typeof items[number], null> & { urgencyScore: number } =>
        item !== null && item.urgencyScore > 1,
      )
      .sort((a, b) => b.urgencyScore - a.urgencyScore);

    return { success: true, items: suggestedItems };
  } catch (error) {
    console.error('Error fetching suggested items:', error);
    return { success: false, error: 'Failed to fetch suggestions' };
  }
}
