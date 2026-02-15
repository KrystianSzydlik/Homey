'use server';

import { prisma } from '@/lib/prisma';
import { serializeDecimals } from '@/lib/serializers';
import {
  ShoppingListActionResult,
  ShoppingListWithItems,
} from '@/types/shopping';
import { z } from 'zod';
import { getHouseholdId, getSessionData } from './auth-utils';
import {
  createShoppingListSchema,
  updateShoppingListSchema,
} from './validation/shopping-schemas';

interface CreateShoppingListInput {
  name: string;
  emoji?: string;
  color?: string;
}

interface UpdateShoppingListInput {
  name?: string;
  emoji?: string;
  color?: string;
}

export async function createShoppingList(
  input: CreateShoppingListInput
): Promise<ShoppingListActionResult> {
  try {
    const { householdId, userId } = await getSessionData();

    const validatedInput = createShoppingListSchema.parse(input);

    // Get max position for ordering
    const maxPosition = await prisma.shoppingList.findFirst({
      where: { householdId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (maxPosition?.position ?? -1) + 1;

    const list = await prisma.shoppingList.create({
      data: {
        name: validatedInput.name,
        emoji: validatedInput.emoji,
        color: validatedInput.color,
        position: nextPosition,
        householdId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return { success: true, list };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error creating shopping list:', error);
    return { success: false, error: 'Failed to create list' };
  }
}

export async function updateShoppingList(
  listId: string,
  input: UpdateShoppingListInput
): Promise<ShoppingListActionResult> {
  try {
    const householdId = await getHouseholdId();

    const validatedInput = updateShoppingListSchema.parse(input);

    // Verify list belongs to household
    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, householdId },
    });

    if (!list) {
      return { success: false, error: 'Shopping list not found' };
    }

    const updateData: Partial<{
      name: string;
      emoji: string | null;
      color: string | null;
    }> = {};
    if (validatedInput.name !== undefined)
      updateData.name = validatedInput.name;
    if (validatedInput.emoji !== undefined)
      updateData.emoji = validatedInput.emoji;
    if (validatedInput.color !== undefined)
      updateData.color = validatedInput.color;

    const updatedList = await prisma.shoppingList.update({
      where: { id: listId },
      data: updateData,
      include: {
        createdBy: {
          select: { name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return { success: true, list: updatedList };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error updating shopping list:', error);
    return { success: false, error: 'Failed to update list' };
  }
}

export async function deleteShoppingList(
  listId: string
): Promise<ShoppingListActionResult> {
  try {
    const householdId = await getHouseholdId();

    // Verify list belongs to household
    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, householdId },
    });

    if (!list) {
      return { success: false, error: 'Shopping list not found' };
    }

    await prisma.shoppingList.delete({
      where: { id: listId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return { success: false, error: 'Failed to delete list' };
  }
}

interface GetShoppingListsResult {
  success: boolean;
  lists?: ShoppingListWithItems[];
  error?: string;
}

export async function getShoppingLists(): Promise<GetShoppingListsResult> {
  try {
    const householdId = await getHouseholdId();

    const lists = await prisma.shoppingList.findMany({
      where: { householdId },
      orderBy: { position: 'asc' },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            createdBy: {
              select: { name: true },
            },
            shoppingList: {
              select: { name: true, emoji: true },
            },
            product: {
              select: { name: true, emoji: true },
            },
          },
        },
        createdBy: {
          select: { name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return { success: true, lists: serializeDecimals(lists) };
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return { success: false, error: 'Failed to fetch lists' };
  }
}

export async function reorderShoppingLists(
  listIds: string[]
): Promise<ShoppingListActionResult> {
  try {
    const householdId = await getHouseholdId();

    // Verify all lists belong to household
    const lists = await prisma.shoppingList.findMany({
      where: { householdId, id: { in: listIds } },
    });

    if (lists.length !== listIds.length) {
      return { success: false, error: 'Some lists not found' };
    }

    // Update position for each list
    const updatePromises = listIds.map((id, index) =>
      prisma.shoppingList.update({
        where: { id },
        data: { position: index },
      })
    );

    await Promise.all(updatePromises);

    return { success: true };
  } catch (error) {
    console.error('Error reordering shopping lists:', error);
    return { success: false, error: 'Failed to reorder lists' };
  }
}
