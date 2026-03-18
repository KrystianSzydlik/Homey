import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reorderShoppingItems } from '../reorder';
import * as authUtils from '@/app/lib/auth-utils';

const { mockPrisma, mockGetHouseholdId } = vi.hoisted(() => {
  const mockGetHouseholdId = vi.fn();
  const mockPrisma = {
    shoppingItem: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((promises: any[]) => Promise.all(promises)),
  };
  return { mockPrisma, mockGetHouseholdId };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.spyOn(authUtils, 'getHouseholdId').mockImplementation(() => mockGetHouseholdId());

describe('reorderShoppingItems', () => {
  const mockHouseholdId = 'household-123';
  const mockListId = 'clh1234567890list1';
  const mockItemIds = ['clh1234567890item1', 'clh1234567890item2', 'clh1234567890item3'];

  const mockItems = mockItemIds.map((id, index) => ({
    id,
    householdId: mockHouseholdId,
    shoppingListId: mockListId,
    position: index,
  }));

  beforeEach(() => {
    mockGetHouseholdId.mockResolvedValue(mockHouseholdId);
    mockPrisma.shoppingItem.findMany.mockReset();
    mockPrisma.shoppingItem.update.mockReset();
    mockPrisma.$transaction.mockReset();
    mockPrisma.$transaction.mockImplementation((updates) => Promise.all(updates));
  });

  it('successfully reorders items in a transaction', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue(mockItems);

    const result = await reorderShoppingItems(mockListId, mockItemIds);

    expect(result.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('returns error for invalid list ID format', async () => {
    const result = await reorderShoppingItems('invalid-list', mockItemIds);

    expect(result.success).toBe(false);
    expect(mockPrisma.shoppingItem.findMany).not.toHaveBeenCalled();
  });

  it('returns error for invalid item ID format in array', async () => {
    const result = await reorderShoppingItems(mockListId, ['invalid-id', 'clh1234567890item2']);

    expect(result.success).toBe(false);
    expect(mockPrisma.shoppingItem.findMany).not.toHaveBeenCalled();
  });

  it('returns error when some items not found (includes household isolation)', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue([mockItems[0]]);

    const result = await reorderShoppingItems(mockListId, mockItemIds);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Some items not found');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns error on database failure', async () => {
    mockPrisma.shoppingItem.findMany.mockRejectedValue(new Error('DB error'));

    const result = await reorderShoppingItems(mockListId, mockItemIds);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to reorder items');
  });

  it('returns error on transaction failure', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue(mockItems);
    mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

    const result = await reorderShoppingItems(mockListId, mockItemIds);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to reorder items');
  });
});
