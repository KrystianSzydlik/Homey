import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deleteShoppingItem } from '../delete';
import * as authUtils from '@/app/lib/auth-utils';

const { mockPrisma, mockGetHouseholdId } = vi.hoisted(() => {
  const mockGetHouseholdId = vi.fn();
  const mockPrisma = {
    shoppingItem: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  };
  return { mockPrisma, mockGetHouseholdId };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.spyOn(authUtils, 'getHouseholdId').mockImplementation(() => mockGetHouseholdId());

describe('deleteShoppingItem', () => {
  const mockHouseholdId = 'household-123';
  const mockItemId = 'clh1234567890item1';
  const mockUserId = 'user-456';

  const mockItem = {
    id: mockItemId,
    householdId: mockHouseholdId,
    checked: false,
    name: 'Apples',
    quantity: '1',
    unit: 'kg',
    category: 'FRUITS' as const,
    emoji: '🍎',
    position: 0,
    price: '10.50',
    purchaseCount: 5,
    lastPurchasedAt: new Date('2025-01-01'),
    createdById: mockUserId,
    shoppingListId: 'list-123',
    productId: 'product-456',
  };

  beforeEach(() => {
    mockGetHouseholdId.mockResolvedValue(mockHouseholdId);
    mockPrisma.shoppingItem.findFirst.mockReset();
    mockPrisma.shoppingItem.delete.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('successfully deletes item', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.delete.mockResolvedValue(mockItem);

    const result = await deleteShoppingItem(mockItemId);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockPrisma.shoppingItem.delete).toHaveBeenCalledWith({
      where: { id: mockItemId },
    });
  });

  it('verifies item exists before deletion', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.delete.mockResolvedValue(mockItem);

    await deleteShoppingItem(mockItemId);

    expect(mockPrisma.shoppingItem.findFirst).toHaveBeenCalledWith({
      where: { id: mockItemId, householdId: mockHouseholdId },
    });
  });

  it('returns error for invalid item ID format', async () => {
    const result = await deleteShoppingItem('invalid-id');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockPrisma.shoppingItem.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.shoppingItem.delete).not.toHaveBeenCalled();
  });

  it('returns error when item not found', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);

    const result = await deleteShoppingItem(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Item not found');
    expect(mockPrisma.shoppingItem.delete).not.toHaveBeenCalled();
  });

  it('returns error when item belongs to different household', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);

    const result = await deleteShoppingItem(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Item not found');
  });

  it('returns error on database failure during deletion', async () => {
    const dbError = new Error('Database connection failed');
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.delete.mockRejectedValue(dbError);

    const result = await deleteShoppingItem(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to delete item');
  });

  it('returns error on database failure during find', async () => {
    const dbError = new Error('Database connection failed');
    mockPrisma.shoppingItem.findFirst.mockRejectedValue(dbError);

    const result = await deleteShoppingItem(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to delete item');
    expect(mockPrisma.shoppingItem.delete).not.toHaveBeenCalled();
  });

  it('deletes item with specific ID', async () => {
    const itemId = 'clh9876543210item2';
    mockPrisma.shoppingItem.findFirst.mockResolvedValue({
      ...mockItem,
      id: itemId,
    });
    mockPrisma.shoppingItem.delete.mockResolvedValue({
      ...mockItem,
      id: itemId,
    });

    await deleteShoppingItem(itemId);

    expect(mockPrisma.shoppingItem.delete).toHaveBeenCalledWith({
      where: { id: itemId },
    });
  });

  it('checks authorization by verifying household ownership', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.delete.mockResolvedValue(mockItem);

    await deleteShoppingItem(mockItemId);

    expect(mockPrisma.shoppingItem.findFirst).toHaveBeenCalledWith({
      where: { id: mockItemId, householdId: mockHouseholdId },
    });
  });
});
