'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ShoppingCategory } from '@prisma/client';
import { redirect } from 'next/navigation';

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

async function getHouseholdId() {
  const session = await auth();
  if (!session?.user?.householdId) {
    redirect('/login');
  }
  return session.user.householdId;
}

export async function createShoppingItem(input: CreateShoppingItemInput) {
  try {
    const householdId = await getHouseholdId();
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Get max position for ordering
    const maxPosition = await prisma.shoppingItem.findFirst({
      where: { householdId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (maxPosition?.position ?? -1) + 1;

    const item = await prisma.shoppingItem.create({
      data: {
        name: input.name,
        quantity: input.quantity || '1',
        unit: input.unit,
        category: input.category || 'OTHER',
        emoji: input.emoji,
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
    console.error('Error creating shopping item:', error);
    return { success: false, error: 'Failed to create item' };
  }
}

export async function updateShoppingItem(
  itemId: string,
  input: UpdateShoppingItemInput,
) {
  try {
    const householdId = await getHouseholdId();

    // Verify item belongs to household
    const item = await prisma.shoppingItem.findFirst({
      where: { id: itemId, householdId },
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    const updatedItem = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.quantity && { quantity: input.quantity }),
        ...(input.unit !== undefined && { unit: input.unit }),
        ...(input.category && { category: input.category }),
        ...(input.emoji !== undefined && { emoji: input.emoji }),
        ...(input.checked !== undefined && { checked: input.checked }),
      },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    return { success: true, item: updatedItem };
  } catch (error) {
    console.error('Error updating shopping item:', error);
    return { success: false, error: 'Failed to update item' };
  }
}

export async function deleteShoppingItem(itemId: string) {
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

export async function toggleShoppingItemChecked(itemId: string) {
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

export async function clearCheckedItems() {
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

export async function reorderShoppingItems(itemIds: string[]) {
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
