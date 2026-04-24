import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toggleShoppingItemChecked } from '../toggle';
import * as authUtils from '@/app/lib/auth-utils';

const { mockPrisma, mockGetSessionData } = vi.hoisted(() => {
  const mockGetSessionData = vi.fn();
  const mockPrisma = {
    shoppingItem: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    purchaseRecord: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { mockPrisma, mockGetSessionData };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.spyOn(authUtils, 'getSessionData').mockImplementation(() => mockGetSessionData());

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
    note: null,
    createdById: mockUserId,
    shoppingListId: 'list-123',
    productId: 'product-456',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRelatedData = {
    createdBy: { name: 'John' },
    shoppingList: { name: 'Biedronka', emoji: '🛒' },
    product: { name: 'Apples', emoji: '🍎' },
  };

  beforeEach(() => {
    mockGetSessionData.mockResolvedValue({
      householdId: mockHouseholdId,
      userId: mockUserId,
    });
    mockPrisma.shoppingItem.findFirst.mockReset();
    mockPrisma.shoppingItem.update.mockReset();
    mockPrisma.product.findUnique.mockReset();
    mockPrisma.product.update.mockReset();
    mockPrisma.purchaseRecord.create.mockReset();
    mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
    mockPrisma.product.findUnique.mockResolvedValue({ lastPurchasedAt: null, averageDaysBetweenPurchases: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('toggles unchecked→checked, creates PurchaseRecord, bumps Product stats', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(mockItem);
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      checked: true,
      ...mockRelatedData,
    });

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(true);
    expect(result.item?.checked).toBe(true);
    expect(mockPrisma.purchaseRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: 'product-456',
        quantity: 1,
        unit: 'kg',
        shoppingItemId: mockItemId,
        householdId: mockHouseholdId,
        createdById: mockUserId,
      }),
    });
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-456' },
      data: {
        purchaseCount: { increment: 1 },
        lastPurchasedAt: expect.any(Date),
      },
    });
  });

  it('toggles checked→unchecked without creating PurchaseRecord', async () => {
    const checkedItem = { ...mockItem, checked: true };
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(checkedItem);
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...checkedItem,
      checked: false,
      ...mockRelatedData,
    });

    const result = await toggleShoppingItemChecked(mockItemId);

    expect(result.success).toBe(true);
    expect(result.item?.checked).toBe(false);
    expect(mockPrisma.purchaseRecord.create).not.toHaveBeenCalled();
    expect(mockPrisma.product.update).not.toHaveBeenCalled();
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
