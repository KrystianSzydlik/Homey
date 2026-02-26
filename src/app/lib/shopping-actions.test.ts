import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createShoppingItem,
  toggleShoppingItemChecked,
  clearCheckedItems,
  deleteAllShoppingItems,
  reorderShoppingItems,
} from './shopping-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const { mockPrisma, mockAuth } = vi.hoisted(() => {
  const mockAuth = vi.fn();
  const mockPrisma = {
    shoppingItem: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    shoppingList: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((promises: Promise<unknown>[]) => Promise.all(promises)),
  };
  return { mockPrisma, mockAuth };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));
vi.mock('@/auth', () => ({
  auth: mockAuth,
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Shopping Actions - Additional Tests', () => {
  const mockUserId = 'user-123';
  const mockHouseholdId = 'household-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        householdId: mockHouseholdId,
      },
    });
  });

  describe('createShoppingItem', () => {
    it('should create an item successfully', async () => {
      const input = {
        name: 'Milk',
        shoppingListId: 'clh1234567890list1',
        productId: 'prod-1',
      };

      (prisma.shoppingList.findFirst as any).mockResolvedValue({ id: 'clh1234567890list1' });
      (prisma.shoppingItem.findFirst as any).mockResolvedValue(null);
      (prisma.shoppingItem.create as any).mockResolvedValue({
        id: 'clh1234567890item1',
        ...input,
        position: 0,
        householdId: mockHouseholdId,
        createdBy: { name: 'Test User' },
        product: null,
        shoppingList: { name: 'My List', emoji: '🛒' },
      });

      const result = await createShoppingItem(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.item).toBeDefined();
        expect(result.item?.name).toBe('Milk');
      }
    });
  });

  describe('toggleShoppingItemChecked', () => {
    it('should toggle item to checked and increment purchase count', async () => {
      const itemId = 'clh1234567890item1';
      const mockItem = {
        id: itemId,
        householdId: mockHouseholdId,
        checked: false,
        purchaseCount: 0,
        lastPurchasedAt: null,
        averageDaysBetweenPurchases: null,
      };

      (prisma.shoppingItem.findFirst as any).mockResolvedValue(mockItem);
      (prisma.shoppingItem.update as any).mockResolvedValue({
        ...mockItem,
        checked: true,
        purchaseCount: 1,
      });

      const result = await toggleShoppingItemChecked(itemId);

      expect(result.success).toBe(true);
      expect(prisma.shoppingItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: expect.objectContaining({
          checked: true,
          purchaseCount: 1,
          lastPurchasedAt: expect.any(Date),
          averageDaysBetweenPurchases: 0,
        }),
        include: {
          createdBy: {
            select: { name: true },
          },
          product: {
            select: { name: true, emoji: true },
          },
          shoppingList: {
            select: { name: true, emoji: true },
          },
        },
      });
    });

    it('should calculate average days between purchases on subsequent purchase', async () => {
      const itemId = 'clh1234567890item1';
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const mockItem = {
        id: itemId,
        householdId: mockHouseholdId,
        checked: false,
        purchaseCount: 2,
        lastPurchasedAt: tenDaysAgo,
        averageDaysBetweenPurchases: 8,
      };

      (prisma.shoppingItem.findFirst as any).mockResolvedValue(mockItem);
      (prisma.shoppingItem.update as any).mockResolvedValue({
        ...mockItem,
        checked: true,
        purchaseCount: 3,
      });

      const result = await toggleShoppingItemChecked(itemId);

      expect(result.success).toBe(true);
      expect(prisma.shoppingItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: expect.objectContaining({
          checked: true,
          purchaseCount: 3,
          lastPurchasedAt: expect.any(Date),
          averageDaysBetweenPurchases: expect.any(Number),
        }),
        include: {
          createdBy: {
            select: { name: true },
          },
          product: {
            select: { name: true, emoji: true },
          },
          shoppingList: {
            select: { name: true, emoji: true },
          },
        },
      });

      const updateCall = (prisma.shoppingItem.update as any).mock.calls[0][0];
      const newAverage = updateCall.data.averageDaysBetweenPurchases;
      expect(newAverage).toBeGreaterThan(8);
      expect(newAverage).toBeLessThan(10);
    });

    it('should toggle item to unchecked without updating statistics', async () => {
      const itemId = 'clh1234567890item1';
      const mockItem = {
        id: itemId,
        householdId: mockHouseholdId,
        checked: true,
        purchaseCount: 5,
        lastPurchasedAt: new Date(),
        averageDaysBetweenPurchases: 7,
      };

      (prisma.shoppingItem.findFirst as any).mockResolvedValue(mockItem);
      (prisma.shoppingItem.update as any).mockResolvedValue({
        ...mockItem,
        checked: false,
      });

      const result = await toggleShoppingItemChecked(itemId);

      expect(result.success).toBe(true);
      expect(prisma.shoppingItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: { checked: false },
        include: {
          createdBy: {
            select: { name: true },
          },
          product: {
            select: { name: true, emoji: true },
          },
          shoppingList: {
            select: { name: true, emoji: true },
          },
        },
      });
    });

    it('should return error if item not found', async () => {
      (prisma.shoppingItem.findFirst as any).mockResolvedValue(null);

      const result = await toggleShoppingItemChecked('clh123456789item99');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Item not found');
      }
      expect(prisma.shoppingItem.update).not.toHaveBeenCalled();
    });

    it('should verify household access before toggling', async () => {
      const itemId = 'clh1234567890item1';

      (prisma.shoppingItem.findFirst as any).mockResolvedValue({
        id: itemId,
        householdId: mockHouseholdId,
        checked: false,
      });
      (prisma.shoppingItem.update as any).mockResolvedValue({});

      await toggleShoppingItemChecked(itemId);

      expect(prisma.shoppingItem.findFirst).toHaveBeenCalledWith({
        where: { id: itemId, householdId: mockHouseholdId },
      });
    });

    it('should return updated item with creator info', async () => {
      const itemId = 'clh1234567890item1';
      const mockItem = {
        id: itemId,
        householdId: mockHouseholdId,
        checked: false,
        purchaseCount: 0,
        lastPurchasedAt: null,
        averageDaysBetweenPurchases: null,
      };

      const mockUpdatedItem = {
        ...mockItem,
        checked: true,
        purchaseCount: 1,
        createdBy: { name: 'Test User' },
      };

      (prisma.shoppingItem.findFirst as any).mockResolvedValue(mockItem);
      (prisma.shoppingItem.update as any).mockResolvedValue(mockUpdatedItem);

      const result = await toggleShoppingItemChecked(itemId);

      expect(result.success).toBe(true);
      if (result.success && result.item) {
        expect(result.item.createdBy).toEqual({ name: 'Test User' });
      }
    });
  });

  describe('clearCheckedItems', () => {
    const input = { itemIds: ['clh1234567890item1', 'clh1234567890item2'] };

    it('should delete all checked items for household', async () => {
      (prisma.shoppingItem.deleteMany as any).mockResolvedValue({ count: 5 });

      const result = await clearCheckedItems(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.deletedCount).toBe(5);
      }
      expect(prisma.shoppingItem.deleteMany).toHaveBeenCalledWith({
        where: {
          householdId: mockHouseholdId,
          checked: true,
          id: { in: input.itemIds },
        },
      });
    });

    it('should return zero if no checked items found', async () => {
      (prisma.shoppingItem.deleteMany as any).mockResolvedValue({ count: 0 });

      const result = await clearCheckedItems(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.deletedCount).toBe(0);
      }
    });

    it('should scope deletion to household', async () => {
      (prisma.shoppingItem.deleteMany as any).mockResolvedValue({ count: 3 });

      await clearCheckedItems(input);

      expect(prisma.shoppingItem.deleteMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          householdId: mockHouseholdId,
        }),
      });
    });

    it('should only delete checked items', async () => {
      (prisma.shoppingItem.deleteMany as any).mockResolvedValue({ count: 2 });

      await clearCheckedItems(input);

      expect(prisma.shoppingItem.deleteMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          checked: true,
        }),
      });
    });

    it('should return error on database failure', async () => {
      (prisma.shoppingItem.deleteMany as any).mockRejectedValue(
        new Error('DB error')
      );

      const result = await clearCheckedItems(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to clear items');
      }
    });

    it('should return validation error when itemIds is empty', async () => {
      const result = await clearCheckedItems({ itemIds: [] });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
      expect(prisma.shoppingItem.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('deleteAllShoppingItems', () => {
    it('should delete all items in a shopping list', async () => {
      const listId = 'clh1234567890list1';

      (prisma.shoppingList.findFirst as any).mockResolvedValue({
        id: listId,
        householdId: mockHouseholdId,
      });
      (prisma.shoppingItem.deleteMany as any).mockResolvedValue({ count: 10 });

      const result = await deleteAllShoppingItems(listId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.deletedCount).toBe(10);
      }
      expect(prisma.shoppingItem.deleteMany).toHaveBeenCalledWith({
        where: { shoppingListId: listId },
      });
    });

    it('should return error if shopping list not found', async () => {
      (prisma.shoppingList.findFirst as any).mockResolvedValue(null);

      const result = await deleteAllShoppingItems('clh123456789list99');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Shopping list not found');
      }
      expect(prisma.shoppingItem.deleteMany).not.toHaveBeenCalled();
    });

    it('should verify household access before deleting', async () => {
      const listId = 'clh1234567890list1';

      (prisma.shoppingList.findFirst as any).mockResolvedValue({
        id: listId,
        householdId: mockHouseholdId,
      });
      (prisma.shoppingItem.deleteMany as any).mockResolvedValue({ count: 0 });

      await deleteAllShoppingItems(listId);

      expect(prisma.shoppingList.findFirst).toHaveBeenCalledWith({
        where: { id: listId, householdId: mockHouseholdId },
      });
    });

    it('should delete items regardless of checked status', async () => {
      const listId = 'clh1234567890list1';

      (prisma.shoppingList.findFirst as any).mockResolvedValue({
        id: listId,
        householdId: mockHouseholdId,
      });
      (prisma.shoppingItem.deleteMany as any).mockResolvedValue({ count: 7 });

      await deleteAllShoppingItems(listId);

      expect(prisma.shoppingItem.deleteMany).toHaveBeenCalledWith({
        where: { shoppingListId: listId },
      });
    });

    it('should return zero if list is empty', async () => {
      const listId = 'clh1234567890list1';

      (prisma.shoppingList.findFirst as any).mockResolvedValue({
        id: listId,
        householdId: mockHouseholdId,
      });
      (prisma.shoppingItem.deleteMany as any).mockResolvedValue({ count: 0 });

      const result = await deleteAllShoppingItems(listId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.deletedCount).toBe(0);
      }
    });

    it('should return error on database failure', async () => {
      const listId = 'clh1234567890list1';

      (prisma.shoppingList.findFirst as any).mockResolvedValue({
        id: listId,
        householdId: mockHouseholdId,
      });
      (prisma.shoppingItem.deleteMany as any).mockRejectedValue(
        new Error('DB error')
      );

      const result = await deleteAllShoppingItems(listId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to delete items');
      }
    });
  });

  describe('reorderShoppingItems', () => {
    it('should update positions for all items', async () => {
      const listId = 'clh1234567890list1';
      const itemIds = ['clh1234567890item1', 'clh1234567890item2', 'clh1234567890item3'];

      const mockItems = itemIds.map((id) => ({
        id,
        householdId: mockHouseholdId,
        shoppingListId: listId,
      }));

      (prisma.shoppingItem.findMany as any).mockResolvedValue(mockItems);
      (prisma.shoppingItem.update as any).mockResolvedValue({});

      const result = await reorderShoppingItems(listId, itemIds);

      expect(result.success).toBe(true);
      expect(prisma.shoppingItem.update).toHaveBeenCalledTimes(3);

      itemIds.forEach((id, index) => {
        expect(prisma.shoppingItem.update).toHaveBeenCalledWith({
          where: { id },
          data: { position: index },
        });
      });
    });

    it('should return error if some items not found', async () => {
      const listId = 'clh1234567890list1';
      const itemIds = ['clh1234567890item1', 'clh1234567890item2', 'clh1234567890item3'];

      const mockItems = [
        { id: 'clh1234567890item1', householdId: mockHouseholdId, shoppingListId: listId },
        { id: 'clh1234567890item2', householdId: mockHouseholdId, shoppingListId: listId },
      ];

      (prisma.shoppingItem.findMany as any).mockResolvedValue(mockItems);

      const result = await reorderShoppingItems(listId, itemIds);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Some items not found');
      }
      expect(prisma.shoppingItem.update).not.toHaveBeenCalled();
    });

    it('should verify all items belong to household and list', async () => {
      const listId = 'clh1234567890list1';
      const itemIds = ['clh1234567890item1', 'clh1234567890item2'];

      (prisma.shoppingItem.findMany as any).mockResolvedValue([]);

      await reorderShoppingItems(listId, itemIds);

      expect(prisma.shoppingItem.findMany).toHaveBeenCalledWith({
        where: {
          householdId: mockHouseholdId,
          shoppingListId: listId,
          id: { in: itemIds },
        },
      });
    });

    it('should return validation error for empty item array', async () => {
      const listId = 'clh1234567890list1';
      const itemIds: string[] = [];

      const result = await reorderShoppingItems(listId, itemIds);

      expect(result.success).toBe(false);
      expect(prisma.shoppingItem.update).not.toHaveBeenCalled();
    });

    it('should maintain position order matching itemIds order', async () => {
      const listId = 'clh1234567890list1';
      const itemIds = ['clh1234567890item3', 'clh1234567890item1', 'clh1234567890item2'];

      const mockItems = itemIds.map((id) => ({
        id,
        householdId: mockHouseholdId,
        shoppingListId: listId,
      }));

      (prisma.shoppingItem.findMany as any).mockResolvedValue(mockItems);
      (prisma.shoppingItem.update as any).mockResolvedValue({});

      await reorderShoppingItems(listId, itemIds);

      expect(prisma.shoppingItem.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'clh1234567890item3' },
        data: { position: 0 },
      });
      expect(prisma.shoppingItem.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'clh1234567890item1' },
        data: { position: 1 },
      });
      expect(prisma.shoppingItem.update).toHaveBeenNthCalledWith(3, {
        where: { id: 'clh1234567890item2' },
        data: { position: 2 },
      });
    });

    it('should return error on database failure', async () => {
      const listId = 'clh1234567890list1';
      const itemIds = ['clh1234567890item1', 'clh1234567890item2'];

      const mockItems = itemIds.map((id) => ({
        id,
        householdId: mockHouseholdId,
        shoppingListId: listId,
      }));

      (prisma.shoppingItem.findMany as any).mockResolvedValue(mockItems);
      (prisma.shoppingItem.update as any).mockRejectedValue(
        new Error('DB error')
      );

      const result = await reorderShoppingItems(listId, itemIds);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to reorder items');
      }
    });
  });
});
