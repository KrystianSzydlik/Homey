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

  beforeEach(() => {
    mockGetHouseholdId.mockResolvedValue(mockHouseholdId);
    mockPrisma.shoppingItem.findFirst.mockReset();
    mockPrisma.shoppingItem.update.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('successfully toggles checked state from false to true', async () => {
    const updatedItem = {
      ...mockItem,
      checked: true,
      purchaseCount: 6,
    };

    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...updatedItem,
      createdBy: { name: 'John' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(true);
    expect(result.item?.checked).toBe(true);
    expect(mockPrisma.shoppingItem.findFirst).toHaveBeenCalledWith({
      where: { id: mockItemId, householdId: mockHouseholdId },
    });
    expect(mockPrisma.shoppingItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockItemId },
        data: expect.objectContaining({ checked: true }),
      })
    );
  });

  it('successfully toggles checked state from true to false', async () => {
    const checkedItem = { ...mockItem, checked: true };
    const updatedItem = {
      ...checkedItem,
      checked: false,
      purchaseCount: 5,
    };

    mockPrisma.shoppingItem.findFirst.mockResolvedValue(checkedItem);
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...updatedItem,
      createdBy: { name: 'John' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(true);
    expect(result.item?.checked).toBe(false);
  });

  it('returns error for invalid item ID format', async () => {
    const result = await toggleShoppingItemChecked('invalid-id');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockPrisma.shoppingItem.findFirst).not.toHaveBeenCalled();
  });

  it('returns error when item not found', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Item not found');
    expect(mockPrisma.shoppingItem.update).not.toHaveBeenCalled();
  });

  it('returns error when item belongs to different household', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Item not found');
  });

  it('returns error on database failure', async () => {
    const dbError = new Error('Database connection failed');
    mockPrisma.shoppingItem.findFirst.mockRejectedValue(dbError);

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to toggle item');
  });

  it('calls calculatePurchaseStats with item and new state', async () => {
    const calculateStatsSpy = vi.spyOn(purchaseStats, 'calculatePurchaseStats');

    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      checked: true,
      createdBy: { name: 'John' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    await toggleShoppingItemChecked(mockItemId);

    expect(calculateStatsSpy).toHaveBeenCalledWith(mockItem, true);

    calculateStatsSpy.mockRestore();
  });

  it('includes related data in response', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      checked: true,
      createdBy: { name: 'John Doe' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.item).toHaveProperty('createdBy');
    expect(result.item).toHaveProperty('shoppingList');
    expect(result.item).toHaveProperty('product');
  });
});
