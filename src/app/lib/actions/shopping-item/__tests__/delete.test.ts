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

  const mockItem = {
    id: mockItemId,
    householdId: mockHouseholdId,
    name: 'Apples',
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
    expect(mockPrisma.shoppingItem.delete).toHaveBeenCalledWith({
      where: { id: mockItemId },
    });
  });

  it('returns error for invalid item ID format', async () => {
    const result = await deleteShoppingItem('invalid-id');

    expect(result.success).toBe(false);
    expect(mockPrisma.shoppingItem.findFirst).not.toHaveBeenCalled();
  });

  it('returns error when item not found (includes household isolation)', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);

    const result = await deleteShoppingItem(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Item not found');
    expect(mockPrisma.shoppingItem.delete).not.toHaveBeenCalled();
  });

  it('returns error on database failure', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.delete.mockRejectedValue(new Error('DB error'));

    const result = await deleteShoppingItem(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to delete item');
  });
});
