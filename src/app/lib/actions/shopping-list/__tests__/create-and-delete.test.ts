import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShoppingList } from '../create';
import { deleteShoppingList } from '../delete';
import * as authUtils from '@/app/lib/auth-utils';

const { mockPrisma, mockGetSessionData, mockGetHouseholdId } = vi.hoisted(() => {
  const mockGetSessionData = vi.fn();
  const mockGetHouseholdId = vi.fn();
  const mockPrisma = {
    shoppingList: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  };
  return { mockPrisma, mockGetSessionData, mockGetHouseholdId };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.spyOn(authUtils, 'getSessionData').mockImplementation(() => mockGetSessionData());
vi.spyOn(authUtils, 'getHouseholdId').mockImplementation(() => mockGetHouseholdId());

describe('Shopping List Operations', () => {
  const mockHouseholdId = 'household-123';
  const mockUserId = 'user-456';
  const mockListId = 'clh1234567890list1';

  const mockSession = { householdId: mockHouseholdId, userId: mockUserId };
  const mockList = {
    id: mockListId,
    householdId: mockHouseholdId,
    name: 'Biedronka',
    emoji: '🛒',
    color: '#FF5733',
    position: 0,
    createdById: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockGetSessionData.mockResolvedValue(mockSession);
    mockGetHouseholdId.mockResolvedValue(mockHouseholdId);
    mockPrisma.shoppingList.findFirst.mockReset();
    mockPrisma.shoppingList.create.mockReset();
    mockPrisma.shoppingList.delete.mockReset();
  });

  describe('createShoppingList', () => {
    it('successfully creates list with all fields', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);
      mockPrisma.shoppingList.create.mockResolvedValue({
        ...mockList,
        createdBy: { name: 'John' },
        _count: { items: 0 },
      });

      const result = await createShoppingList({
        name: 'Biedronka',
        emoji: '🛒',
        color: '#FF5733',
      });

      expect(result.success).toBe(true);
      expect(result.list?.name).toBe('Biedronka');
      expect(result.list?.emoji).toBe('🛒');
    });

    it('successfully creates list with name only', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);
      mockPrisma.shoppingList.create.mockResolvedValue({
        ...mockList,
        name: 'Grocery Store',
        emoji: null,
        color: null,
        createdBy: { name: 'John' },
        _count: { items: 0 },
      });

      const result = await createShoppingList({ name: 'Grocery Store' });

      expect(result.success).toBe(true);
      expect(result.list?.name).toBe('Grocery Store');
    });

    it('sets correct position for new list', async () => {
      const lastList = { position: 2 };
      mockPrisma.shoppingList.findFirst.mockResolvedValue(lastList);
      mockPrisma.shoppingList.create.mockResolvedValue({
        ...mockList,
        position: 3,
        createdBy: { name: 'John' },
        _count: { items: 0 },
      });

      const result = await createShoppingList({ name: 'New List' });

      expect(mockPrisma.shoppingList.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 3 }),
        })
      );
    });

    it('sets position to 0 for first list', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);
      mockPrisma.shoppingList.create.mockResolvedValue({
        ...mockList,
        position: 0,
        createdBy: { name: 'John' },
        _count: { items: 0 },
      });

      const result = await createShoppingList({ name: 'First List' });

      expect(mockPrisma.shoppingList.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 0 }),
        })
      );
    });

    it('returns error when name is missing', async () => {
      const result = await createShoppingList({ name: '' } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockPrisma.shoppingList.create).not.toHaveBeenCalled();
    });

    it('returns error when name exceeds max length', async () => {
      const result = await createShoppingList({ name: 'a'.repeat(51) });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error on database failure', async () => {
      mockPrisma.shoppingList.findFirst.mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await createShoppingList({ name: 'Biedronka' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create list');
    });

    it('includes user ID and household ID in created list', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);
      mockPrisma.shoppingList.create.mockResolvedValue({
        ...mockList,
        createdBy: { name: 'John' },
        _count: { items: 0 },
      });

      await createShoppingList({ name: 'Biedronka' });

      expect(mockPrisma.shoppingList.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            householdId: mockHouseholdId,
            createdById: mockUserId,
          }),
        })
      );
    });

    it('includes counts in response', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);
      mockPrisma.shoppingList.create.mockResolvedValue({
        ...mockList,
        createdBy: { name: 'John' },
        _count: { items: 5 },
      });

      const result = await createShoppingList({ name: 'Biedronka' });

      expect(result.list).toHaveProperty('_count');
      expect(result.list?._count?.items).toBe(5);
    });
  });

  describe('deleteShoppingList', () => {
    it('successfully deletes list', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(mockList);
      mockPrisma.shoppingList.delete.mockResolvedValue(mockList);

      const result = await deleteShoppingList(mockListId);

      expect(result.success).toBe(true);
      expect(mockPrisma.shoppingList.delete).toHaveBeenCalledWith({
        where: { id: mockListId },
      });
    });

    it('verifies list exists before deletion', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(mockList);
      mockPrisma.shoppingList.delete.mockResolvedValue(mockList);

      await deleteShoppingList(mockListId);

      expect(mockPrisma.shoppingList.findFirst).toHaveBeenCalledWith({
        where: { id: mockListId, householdId: mockHouseholdId },
      });
    });

    it('returns error for invalid list ID format', async () => {
      const result = await deleteShoppingList('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockPrisma.shoppingList.findFirst).not.toHaveBeenCalled();
    });

    it('returns error when list not found', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);

      const result = await deleteShoppingList(mockListId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shopping list not found');
      expect(mockPrisma.shoppingList.delete).not.toHaveBeenCalled();
    });

    it('returns error for unauthorized access (different household)', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);

      const result = await deleteShoppingList(mockListId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shopping list not found');
    });

    it('returns error on database failure', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(mockList);
      mockPrisma.shoppingList.delete.mockRejectedValue(
        new Error('Database error')
      );

      const result = await deleteShoppingList(mockListId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete list');
    });

    it('verifies household isolation', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(mockList);
      mockPrisma.shoppingList.delete.mockResolvedValue(mockList);

      await deleteShoppingList(mockListId);

      expect(mockPrisma.shoppingList.findFirst).toHaveBeenCalledWith({
        where: { id: mockListId, householdId: mockHouseholdId },
      });
    });

    it('returns no data on successful deletion', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(mockList);
      mockPrisma.shoppingList.delete.mockResolvedValue(mockList);

      const result = await deleteShoppingList(mockListId);

      expect(result.success).toBe(true);
      expect(result).not.toHaveProperty('list');
    });
  });
});
