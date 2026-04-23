import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSmartReminders } from '../get-smart-reminders';
import { ShoppingCategory } from '@prisma/client';

const { mockPrisma, mockGetHouseholdId } = vi.hoisted(() => ({
  mockGetHouseholdId: vi.fn(),
  mockPrisma: {
    product: { findMany: vi.fn() },
    shoppingItem: { findMany: vi.fn() },
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/app/lib/auth-utils', () => ({ getHouseholdId: mockGetHouseholdId }));

const HOUSEHOLD_ID = 'household-123';

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-1',
    name: 'Milk',
    emoji: '🥛',
    defaultCategory: ShoppingCategory.DAIRY,
    defaultUnit: 'liter',
    lastPurchasedAt: new Date(Date.now() - 10 * 86_400_000), // 10 days ago
    averageDaysBetweenPurchases: 7,                          // avg 7 days → 143% overdue
    ...overrides,
  };
}

describe('getSmartReminders', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetHouseholdId.mockResolvedValue(HOUSEHOLD_ID);
    mockPrisma.shoppingItem.findMany.mockResolvedValue([]);
  });

  it('returns products where daysSince >= averageDays * 0.85', async () => {
    mockPrisma.product.findMany.mockResolvedValue([makeProduct()]);

    const result = await getSmartReminders();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Milk');
    expect(result[0].overdueRatio).toBeGreaterThan(1);
  });

  it('does not return products below the threshold', async () => {
    // 3 days since last purchase, avg 7 days → 3/7 ≈ 43%, below 85%
    mockPrisma.product.findMany.mockResolvedValue([
      makeProduct({ lastPurchasedAt: new Date(Date.now() - 3 * 86_400_000) }),
    ]);

    const result = await getSmartReminders();

    expect(result).toHaveLength(0);
  });

  it('excludes products already on the active list', async () => {
    mockPrisma.product.findMany.mockResolvedValue([makeProduct()]);
    mockPrisma.shoppingItem.findMany.mockResolvedValue([{ productId: 'product-1' }]);

    const result = await getSmartReminders('list-123');

    expect(result).toHaveLength(0);
  });

  it('includes products not on the list even when listId is provided', async () => {
    mockPrisma.product.findMany.mockResolvedValue([makeProduct()]);
    mockPrisma.shoppingItem.findMany.mockResolvedValue([{ productId: 'other-product' }]);

    const result = await getSmartReminders('list-123');

    expect(result).toHaveLength(1);
  });

  it('skips list check when no listId given', async () => {
    mockPrisma.product.findMany.mockResolvedValue([makeProduct()]);

    await getSmartReminders();

    expect(mockPrisma.shoppingItem.findMany).not.toHaveBeenCalled();
  });

  it('sorts by overdueRatio descending — most overdue first', async () => {
    const products = [
      makeProduct({ id: 'p1', name: 'Milk', lastPurchasedAt: new Date(Date.now() - 10 * 86_400_000), averageDaysBetweenPurchases: 7 }),  // ratio ≈1.43
      makeProduct({ id: 'p2', name: 'Bread', lastPurchasedAt: new Date(Date.now() - 20 * 86_400_000), averageDaysBetweenPurchases: 7 }), // ratio ≈2.86
    ];
    mockPrisma.product.findMany.mockResolvedValue(products);

    const result = await getSmartReminders();

    expect(result[0].name).toBe('Bread');
    expect(result[1].name).toBe('Milk');
  });

  it('returns empty array on error', async () => {
    mockPrisma.product.findMany.mockRejectedValue(new Error('DB error'));

    const result = await getSmartReminders();

    expect(result).toEqual([]);
  });
});
