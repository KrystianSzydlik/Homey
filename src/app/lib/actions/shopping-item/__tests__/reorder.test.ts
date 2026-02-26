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
    checked: false,
    name: `Item ${index + 1}`,
    quantity: '1',
    unit: null,
    category: 'OTHER' as const,
    emoji: null,
    position: index,
    price: null,
    purchaseCount: 0,
    lastPurchasedAt: null,
    createdById: 'user-456',
    shoppingListId: mockListId,
    productId: `product-${index}`,
  }));

  beforeEach(() => {
    mockGetHouseholdId.mockResolvedValue(mockHouseholdId);
    mockPrisma.shoppingItem.findMany.mockReset();
    mockPrisma.shoppingItem.update.mockReset();
    mockPrisma.$transaction.mockReset();
  });

  it('successfully reorders items', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue(mockItems);
    mockPrisma.$transaction.mockImplementation((updates) => Promise.all(updates));

    const result = await reorderShoppingItems(mockListId, mockItemIds);

    expect(result.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('updates positions in correct order', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue(mockItems);
    let callCount = 0;
    mockPrisma.shoppingItem.update.mockImplementation(() => {
      callCount++;
      return Promise.resolve(mockItems[callCount - 1]);
    });
    mockPrisma.$transaction.mockImplementation((updates) => Promise.all(updates));

    const newOrder = [mockItemIds[2], mockItemIds[0], mockItemIds[1]];
    await reorderShoppingItems(mockListId, newOrder);

    expect(mockPrisma.$transaction).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.any(Promise),
        expect.any(Promise),
        expect.any(Promise),
      ])
    );
  });

  it('returns error for invalid list ID format', async () => {
    const result = await reorderShoppingItems('invalid-list', mockItemIds);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockPrisma.shoppingItem.findMany).not.toHaveBeenCalled();
  });

  it('returns error for invalid item ID format in array', async () => {
    const invalidIds = ['invalid-id', 'clh1234567890item2'];
    const result = await reorderShoppingItems(mockListId, invalidIds);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockPrisma.shoppingItem.findMany).not.toHaveBeenCalled();
  });

  it('returns error when some items not found', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue([mockItems[0]]);

    const result = await reorderShoppingItems(mockListId, mockItemIds);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Some items not found');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns error when items belong to different list', async () => {
    const itemsFromDifferentList = mockItems.map((item) => ({
      ...item,
      shoppingListId: 'different-list',
    }));
    mockPrisma.shoppingItem.findMany.mockResolvedValue([]);

    const result = await reorderShoppingItems(mockListId, mockItemIds);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Some items not found');
  });

  it('verifies household isolation', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue(mockItems);
    mockPrisma.$transaction.mockImplementation((updates) => Promise.all(updates));

    await reorderShoppingItems(mockListId, mockItemIds);

    expect(mockPrisma.shoppingItem.findMany).toHaveBeenCalledWith({
      where: {
        householdId: mockHouseholdId,
        shoppingListId: mockListId,
        id: { in: mockItemIds },
      },
    });
  });

  it('returns error on database failure', async () => {
    mockPrisma.shoppingItem.findMany.mockRejectedValue(
      new Error('Database connection failed')
    );

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

  it('reorders single item (no-op)', async () => {
    const singleItemId = [mockItemIds[0]];
    mockPrisma.shoppingItem.findMany.mockResolvedValue([mockItems[0]]);
    mockPrisma.$transaction.mockImplementation((updates) => Promise.all(updates));

    const result = await reorderShoppingItems(mockListId, singleItemId);

    expect(result.success).toBe(true);
  });

  it('reorders two items', async () => {
    const twoItems = [mockItems[0], mockItems[1]];
    const reversedIds = [mockItemIds[1], mockItemIds[0]];

    mockPrisma.shoppingItem.findMany.mockResolvedValue(twoItems);
    mockPrisma.$transaction.mockImplementation((updates) => Promise.all(updates));

    const result = await reorderShoppingItems(mockListId, reversedIds);

    expect(result.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
  });

  it('uses transaction for atomicity', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue(mockItems);
    mockPrisma.$transaction.mockImplementation((updates) => Promise.all(updates));

    await reorderShoppingItems(mockListId, mockItemIds);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    const transactionArg = mockPrisma.$transaction.mock.calls[0][0];
    expect(Array.isArray(transactionArg)).toBe(true);
    expect(transactionArg.length).toBe(mockItemIds.length);
  });

  it('returns success with no data', async () => {
    mockPrisma.shoppingItem.findMany.mockResolvedValue(mockItems);
    mockPrisma.$transaction.mockImplementation((updates) => Promise.all(updates));

    const result = await reorderShoppingItems(mockListId, mockItemIds);

    expect(result.success).toBe(true);
    expect(result).not.toHaveProperty('data');
    expect(result).not.toHaveProperty('item');
  });
});
