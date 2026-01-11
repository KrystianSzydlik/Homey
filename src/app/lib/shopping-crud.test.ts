import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
} from './shopping-list-actions';
import {
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} from './shopping-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Mock dependencies - use vi.hoisted to avoid hoisting issues
const { mockPrisma, mockAuth } = vi.hoisted(() => {
  const mockAuth = vi.fn();
  const mockPrisma = {
    shoppingList: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    shoppingItem: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((cb: any) => cb(mockPrisma)),
  };
  return { mockPrisma, mockAuth };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));
vi.mock('next-auth', () => ({
  default: () => ({
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: { GET: vi.fn(), POST: vi.fn() },
  }),
}));
vi.mock('@/auth', () => ({
  auth: mockAuth,
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Shopping List Actions', () => {
  const mockUserId = 'user-123';
  const mockHouseholdId = 'household-123';

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default auth mock
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        householdId: mockHouseholdId,
      },
    });
  });

  describe('createShoppingList', () => {
    it('should create a shopping list successfully', async () => {
      const input = {
        name: 'My New List',
        emoji: '🛒',
        color: '#ffffff',
      };

      const mockList = {
        id: 'list-1',
        ...input,
        position: 0,
        householdId: mockHouseholdId,
        createdById: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.shoppingList.findFirst as any).mockResolvedValue({
        position: -1,
      });
      (prisma.shoppingList.create as any).mockResolvedValue(mockList);

      const result = await createShoppingList(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.list).toEqual(mockList);
      }
      expect(prisma.shoppingList.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: input.name,
          householdId: mockHouseholdId,
          createdById: mockUserId,
        }),
        include: expect.any(Object),
      });
    });

    it('should fail validation with empty name', async () => {
      const input = {
        name: '',
      };

      const result = await createShoppingList(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Name is required');
      }
    });
  });

  describe('updateShoppingList', () => {
    it('should update a shopping list successfully', async () => {
      const listId = 'list-1';
      const input = { name: 'Updated Name' };

      // Mock finding existing list
      (prisma.shoppingList.findFirst as any).mockResolvedValue({ id: listId });

      const mockUpdatedList = {
        id: listId,
        name: input.name,
        householdId: mockHouseholdId,
      };
      (prisma.shoppingList.update as any).mockResolvedValue(mockUpdatedList);

      const result = await updateShoppingList(listId, input);

      expect(result.success).toBe(true);
      expect(prisma.shoppingList.update).toHaveBeenCalled();
    });

    it('should return error if list not found or unauthorized', async () => {
      (prisma.shoppingList.findFirst as any).mockResolvedValue(null);

      const result = await updateShoppingList('list-999', { name: 'New' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Shopping list not found');
      }
    });
  });

  describe('deleteShoppingList', () => {
    it('should delete a shopping list', async () => {
      const listId = 'list-1';

      (prisma.shoppingList.findFirst as any).mockResolvedValue({ id: listId });
      (prisma.shoppingList.delete as any).mockResolvedValue({ id: listId });

      const result = await deleteShoppingList(listId);

      expect(result.success).toBe(true);
      expect(prisma.shoppingList.delete).toHaveBeenCalledWith({
        where: { id: listId },
      });
    });
  });
});

describe('Shopping Item Actions', () => {
  const mockUserId = 'user-123';
  const mockHouseholdId = 'household-123';
  const mockListId = 'list-1';

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
        shoppingListId: mockListId,
        quantity: '1',
        unit: 'liter',
      };

      // Mock validating list access
      (prisma.shoppingList.findFirst as any).mockResolvedValue({
        id: mockListId,
      });

      // Mock getting position
      (prisma.shoppingItem.findFirst as any).mockResolvedValue({ position: 2 });

      const mockItem = {
        id: 'item-1',
        ...input,
        position: 3,
        householdId: mockHouseholdId,
      };
      (prisma.shoppingItem.create as any).mockResolvedValue(mockItem);

      const result = await createShoppingItem(input);

      expect(result.success).toBe(true);
      expect(prisma.shoppingItem.create).toHaveBeenCalled();
    });
  });
});
