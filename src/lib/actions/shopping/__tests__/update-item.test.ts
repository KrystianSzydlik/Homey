import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateShoppingItemDetails } from '../update-item';
import { Decimal } from '@prisma/client/runtime/library';

// Mock dependencies
vi.mock('@/app/lib/auth-utils', () => ({
  getSessionData: vi.fn().mockResolvedValue({
    householdId: 'household-1',
    userId: 'user-1',
  }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    shoppingItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('updateShoppingItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow setting price on unchecked item (draft)', async () => {
    vi.mocked(prisma.shoppingItem.findUnique).mockResolvedValue({
      id: 'cld1234567890abc',
      householdId: 'household-1',
      checked: false,
      name: 'Test Item',
      quantity: '1',
      unit: null,
      category: 'OTHER',
      position: 0,
      emoji: null,
      price: null,
      currency: 'PLN',
      purchasedAt: null,
      purchaseCount: 0,
      lastPurchasedAt: null,
      averageDaysBetweenPurchases: null,
      shoppingListId: 'list-1',
      productId: 'product-1',
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(prisma.shoppingItem.update).mockResolvedValue({
      id: 'cld1234567890abc',
      householdId: 'household-1',
      checked: false,
      name: 'Test Item',
      quantity: '1',
      unit: null,
      category: 'OTHER',
      position: 0,
      emoji: null,
      price: new Decimal(12.99),
      currency: 'PLN',
      purchasedAt: null,
      purchaseCount: 0,
      lastPurchasedAt: null,
      averageDaysBetweenPurchases: null,
      shoppingListId: 'list-1',
      productId: 'product-1',
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateShoppingItemDetails({
      itemId: 'cld1234567890abc',
      price: 12.99,
      checked: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(12.99);
      expect(result.data.purchasedAt).toBeNull();
    }
  });

  it('should set purchasedAt when marking as checked', async () => {
    const now = new Date();

    vi.mocked(prisma.shoppingItem.findUnique).mockResolvedValue({
      id: 'cld1234567890abc',
      householdId: 'household-1',
      checked: false,
      name: 'Test Item',
      quantity: '1',
      unit: null,
      category: 'OTHER',
      position: 0,
      emoji: null,
      price: null,
      currency: 'PLN',
      purchasedAt: null,
      purchaseCount: 0,
      lastPurchasedAt: null,
      averageDaysBetweenPurchases: null,
      shoppingListId: 'list-1',
      productId: 'product-1',
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(prisma.shoppingItem.update).mockResolvedValue({
      id: 'cld1234567890abc',
      householdId: 'household-1',
      checked: true,
      name: 'Test Item',
      quantity: '1',
      unit: null,
      category: 'OTHER',
      position: 0,
      emoji: null,
      price: null,
      currency: 'PLN',
      purchasedAt: now,
      purchaseCount: 0,
      lastPurchasedAt: null,
      averageDaysBetweenPurchases: null,
      shoppingListId: 'list-1',
      productId: 'product-1',
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await updateShoppingItemDetails({
      itemId: 'cld1234567890abc',
      checked: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.purchasedAt).toBeInstanceOf(Date);
    }
  });

  it('should clear purchasedAt when unchecking', async () => {
    vi.mocked(prisma.shoppingItem.findUnique).mockResolvedValue({
      id: 'cld9876543210xyz',
      householdId: 'household-1',
      checked: true,
      name: 'Test Item',
      quantity: '1',
      unit: null,
      category: 'OTHER',
      position: 0,
      emoji: null,
      price: null,
      currency: 'PLN',
      purchasedAt: new Date(),
      purchaseCount: 1,
      lastPurchasedAt: new Date(),
      averageDaysBetweenPurchases: null,
      shoppingListId: 'list-1',
      productId: 'product-1',
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(prisma.shoppingItem.update).mockResolvedValue({
      id: 'cld9876543210xyz',
      householdId: 'household-1',
      checked: false,
      name: 'Test Item',
      quantity: '1',
      unit: null,
      category: 'OTHER',
      position: 0,
      emoji: null,
      price: null,
      currency: 'PLN',
      purchasedAt: null,
      purchaseCount: 1,
      lastPurchasedAt: new Date(),
      averageDaysBetweenPurchases: null,
      shoppingListId: 'list-1',
      productId: 'product-1',
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await updateShoppingItemDetails({
      itemId: 'cld9876543210xyz',
      checked: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.purchasedAt).toBeNull();
    }
  });

  it('should reject negative prices', async () => {
    const result = await updateShoppingItemDetails({
      itemId: 'cld1234567890abc',
      price: -5,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('should return error when item not found', async () => {
    vi.mocked(prisma.shoppingItem.findUnique).mockResolvedValue(null);

    const result = await updateShoppingItemDetails({
      itemId: 'cld1234567890abc',
      quantity: '2',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Item not found');
    }
  });

  it('should return error when item belongs to different household', async () => {
    vi.mocked(prisma.shoppingItem.findUnique).mockResolvedValue({
      householdId: 'other-household',
      checked: false,
    } as any);

    const result = await updateShoppingItemDetails({
      itemId: 'cld1234567890abc',
      quantity: '2',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unauthorized');
    }
  });
});
