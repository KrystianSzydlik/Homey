import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toggleShoppingItemChecked } from '../toggle';
import * as authUtils from '@/app/lib/auth-utils';
import * as purchaseStats from '../purchase-statistics';

const { mockPrisma, mockGetHouseholdId } = vi.hoisted(() => {
  const mockGetHouseholdId = vi.fn();
  const mockPrisma = {
    shoppingItem: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  };
  return { mockPrisma, mockGetHouseholdId };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.spyOn(authUtils, 'getHouseholdId').mockImplementation(() => mockGetHouseholdId());

describe('toggleShoppingItemChecked', () => {
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

  const mockRelatedData = {
    createdBy: { name: 'John' },
    shoppingList: { name: 'Biedronka', emoji: '🛒' },
    product: { name: 'Apples', emoji: '🍎' },
  };

  beforeEach(() => {
    mockGetHouseholdId.mockResolvedValue(mockHouseholdId);
    mockPrisma.shoppingItem.findFirst.mockReset();
    mockPrisma.shoppingItem.update.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('toggles unchecked→checked with related data and purchase stats', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem, checked: true, purchaseCount: 6, ...mockRelatedData,
    });
    const spy = vi.spyOn(purchaseStats, 'calculatePurchaseStats');

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(true);
    expect(result.item?.checked).toBe(true);
    expect(result.item).toHaveProperty('createdBy');
    expect(result.item).toHaveProperty('shoppingList');
    expect(spy).toHaveBeenCalledWith(mockItem, true);
    spy.mockRestore();
  });

  it('toggles checked→unchecked', async () => {
    const checkedItem = { ...mockItem, checked: true };
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(checkedItem);
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...checkedItem, checked: false, ...mockRelatedData,
    });

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(true);
    expect(result.item?.checked).toBe(false);
  });

  it('returns error for invalid item ID format', async () => {
    const result = await toggleShoppingItemChecked('invalid-id');

    expect(result.success).toBe(false);
    expect(mockPrisma.shoppingItem.findFirst).not.toHaveBeenCalled();
  });

  it('returns error when item not found (includes household isolation)', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Item not found');
    expect(mockPrisma.shoppingItem.update).not.toHaveBeenCalled();
  });

  it('returns error on database failure', async () => {
    mockPrisma.shoppingItem.findFirst.mockRejectedValue(new Error('DB error'));

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to toggle item');
  });
});
