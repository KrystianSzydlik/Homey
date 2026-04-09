import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShoppingList } from '../create';
import { deleteShoppingList } from '../delete';
import * as authUtils from '@/app/lib/auth-utils';
import { createMockShoppingList } from '@/test/factories';

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

  const mockList = createMockShoppingList({
    id: mockListId,
    householdId: mockHouseholdId,
    name: 'Biedronka',
    emoji: '🛒',
    color: '#FF5733',
    position: 0,
    createdById: mockUserId,
  });

  const mockRelated = {
    createdBy: { name: 'John' },
    _count: { items: 0 },
  };

  beforeEach(() => {
    mockGetSessionData.mockResolvedValue({ householdId: mockHouseholdId, userId: mockUserId });
    mockGetHouseholdId.mockResolvedValue(mockHouseholdId);
    mockPrisma.shoppingList.findFirst.mockReset();
    mockPrisma.shoppingList.create.mockReset();
    mockPrisma.shoppingList.delete.mockReset();
  });

  describe('createShoppingList', () => {
    it('creates list with all fields, correct position, and IDs', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue({ position: 2 });
      mockPrisma.shoppingList.create.mockResolvedValue(createMockShoppingList({
        ...mockList, position: 3, _count: { items: 5 },
      }));

      const result = await createShoppingList({ name: 'Biedronka', emoji: '🛒', color: '#FF5733' });

      expect(result.success).toBe(true);
      expect(result.list?.name).toBe('Biedronka');
      expect(result.list?._count?.items).toBe(5);
      expect(mockPrisma.shoppingList.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            position: 3, householdId: mockHouseholdId, createdById: mockUserId,
          }),
        })
      );
    });

    it('creates list with name only, position 0 when first', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);
      mockPrisma.shoppingList.create.mockResolvedValue(createMockShoppingList({
        ...mockList, name: 'Grocery', position: 0,
      }));

      const result = await createShoppingList({ name: 'Grocery' });

      expect(result.success).toBe(true);
      expect(mockPrisma.shoppingList.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ position: 0 }) })
      );
    });

    it('returns error for invalid name', async () => {
      const empty = await createShoppingList({ name: '' } as any);
      expect(empty.success).toBe(false);

      const tooLong = await createShoppingList({ name: 'a'.repeat(51) });
      expect(tooLong.success).toBe(false);

      expect(mockPrisma.shoppingList.create).not.toHaveBeenCalled();
    });

    it('returns error on database failure', async () => {
      mockPrisma.shoppingList.findFirst.mockRejectedValue(new Error('DB error'));

      const result = await createShoppingList({ name: 'Biedronka' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create list');
    });
  });

  describe('deleteShoppingList', () => {
    it('successfully deletes list', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(mockList);
      mockPrisma.shoppingList.delete.mockResolvedValue(mockList);

      const result = await deleteShoppingList(mockListId);

      expect(result.success).toBe(true);
      expect(mockPrisma.shoppingList.delete).toHaveBeenCalledWith({ where: { id: mockListId } });
    });

    it('returns error for invalid list ID format', async () => {
      const result = await deleteShoppingList('invalid-id');

      expect(result.success).toBe(false);
      expect(mockPrisma.shoppingList.findFirst).not.toHaveBeenCalled();
    });

    it('returns error when list not found (includes household isolation)', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(null);

      const result = await deleteShoppingList(mockListId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shopping list not found');
      expect(mockPrisma.shoppingList.delete).not.toHaveBeenCalled();
    });

    it('returns error on database failure', async () => {
      mockPrisma.shoppingList.findFirst.mockResolvedValue(mockList);
      mockPrisma.shoppingList.delete.mockRejectedValue(new Error('DB error'));

      const result = await deleteShoppingList(mockListId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete list');
    });
  });
});
