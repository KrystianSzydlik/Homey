import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createShoppingItem } from '../create';
import * as authUtils from '@/app/lib/auth-utils';

const { mockPrisma, mockGetSessionData } = vi.hoisted(() => {
  const mockGetSessionData = vi.fn();
  const mockPrisma = {
    shoppingList: {
      findFirst: vi.fn(),
    },
    shoppingItem: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  };
  return { mockPrisma, mockGetSessionData };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.spyOn(authUtils, 'getSessionData').mockImplementation(() => mockGetSessionData());

describe('createShoppingItem', () => {
  const mockHouseholdId = 'household-123';
  const mockUserId = 'user-456';
  const mockListId = 'list-123';
  const mockProductId = 'product-456';

  const validInput = {
    name: 'Apples',
    quantity: '2',
    unit: 'kg',
    category: 'FRUITS' as const,
    emoji: '🍎',
    shoppingListId: mockListId,
    productId: mockProductId,
  };

  const mockShoppingList = {
    id: mockListId,
    householdId: mockHouseholdId,
  };

  const mockRelatedData = {
    createdBy: { name: 'John' },
    shoppingList: { name: 'Biedronka', emoji: '🛒' },
    product: { name: 'Apples', emoji: '🍎' },
  };

  beforeEach(() => {
    mockGetSessionData.mockResolvedValue({ householdId: mockHouseholdId, userId: mockUserId });
    mockPrisma.shoppingList.findFirst.mockReset();
    mockPrisma.shoppingItem.findFirst.mockReset();
    mockPrisma.shoppingItem.create.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates item with all fields, correct position, and related data', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(mockShoppingList);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue({ position: 5 });
    mockPrisma.shoppingItem.create.mockResolvedValue({
      id: 'clh1234567890item1', ...validInput, position: 6, householdId: mockHouseholdId,
      createdById: mockUserId, ...mockRelatedData,
    });

    const result = await createShoppingItem(validInput);

    expect(result.success).toBe(true);
    expect(result.item?.name).toBe('Apples');
    expect(result.item?.position).toBe(6);
    expect(result.item).toHaveProperty('createdBy');
    expect(mockPrisma.shoppingItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          position: 6,
          householdId: mockHouseholdId,
          createdById: mockUserId,
        }),
      })
    );
  });

  it('creates item with minimal fields, position 0 when list is empty', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(mockShoppingList);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);
    mockPrisma.shoppingItem.create.mockResolvedValue({
      id: 'clh1234567890item1', name: 'Milk', position: 0, category: 'OTHER',
      quantity: '1', ...mockRelatedData,
    });

    const result = await createShoppingItem({
      name: 'Milk', shoppingListId: mockListId, productId: mockProductId,
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.shoppingItem.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ position: 0 }) })
    );
  });

  it('returns error for missing required fields', async () => {
    const noName = await createShoppingItem({ shoppingListId: mockListId, productId: mockProductId } as any);
    expect(noName.success).toBe(false);

    const noList = await createShoppingItem({ name: 'Apples', productId: mockProductId } as any);
    expect(noList.success).toBe(false);

    expect(mockPrisma.shoppingItem.create).not.toHaveBeenCalled();
  });

  it('returns error when shopping list not found (includes household isolation)', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(null);

    const result = await createShoppingItem(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Shopping list not found');
    expect(mockPrisma.shoppingItem.create).not.toHaveBeenCalled();
  });

  it('returns error on database failure', async () => {
    mockPrisma.shoppingList.findFirst.mockRejectedValue(new Error('DB error'));

    const result = await createShoppingItem(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to create item');
  });
});
