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
    name: 'Biedronka',
    emoji: '🛒',
    createdById: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreatedItem = {
    id: 'clh1234567890item1',
    householdId: mockHouseholdId,
    checked: false,
    name: 'Apples',
    quantity: '2',
    unit: 'kg',
    category: 'FRUITS' as const,
    emoji: '🍎',
    position: 0,
    price: null,
    purchaseCount: 0,
    lastPurchasedAt: null,
    createdById: mockUserId,
    shoppingListId: mockListId,
    productId: mockProductId,
  };

  beforeEach(() => {
    mockGetSessionData.mockResolvedValue({
      householdId: mockHouseholdId,
      userId: mockUserId,
    });
    mockPrisma.shoppingList.findFirst.mockReset();
    mockPrisma.shoppingItem.findFirst.mockReset();
    mockPrisma.shoppingItem.create.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('successfully creates item with all fields', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(mockShoppingList);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);
    mockPrisma.shoppingItem.create.mockResolvedValue({
      ...mockCreatedItem,
      createdBy: { name: 'John' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    const result = await createShoppingItem(validInput);

    expect(result.success).toBe(true);
    expect(result.item?.name).toBe('Apples');
    expect(result.item?.quantity).toBe('2');
    expect(result.item?.unit).toBe('kg');
    expect(result.item?.category).toBe('FRUITS');
  });

  it('successfully creates item with minimal fields', async () => {
    const minimalInput = {
      name: 'Milk',
      shoppingListId: mockListId,
      productId: mockProductId,
    };

    mockPrisma.shoppingList.findFirst.mockResolvedValue(mockShoppingList);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);
    mockPrisma.shoppingItem.create.mockResolvedValue({
      ...mockCreatedItem,
      name: 'Milk',
      quantity: '1',
      unit: null,
      category: 'OTHER',
      emoji: null,
      createdBy: { name: 'John' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Milk', emoji: '🥛' },
    });

    const result = await createShoppingItem(minimalInput);

    expect(result.success).toBe(true);
    expect(result.item?.quantity).toBe('1');
    expect(result.item?.category).toBe('OTHER');
  });

  it('sets correct position for new item', async () => {
    const lastItem = { position: 5 };

    mockPrisma.shoppingList.findFirst.mockResolvedValue(mockShoppingList);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(lastItem);
    mockPrisma.shoppingItem.create.mockResolvedValue({
      ...mockCreatedItem,
      position: 6,
      createdBy: { name: 'John' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    const result = await createShoppingItem(validInput);

    expect(mockPrisma.shoppingItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 6 }),
      })
    );
    expect(result.item?.position).toBe(6);
  });

  it('sets position to 0 when no existing items', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(mockShoppingList);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);
    mockPrisma.shoppingItem.create.mockResolvedValue({
      ...mockCreatedItem,
      position: 0,
      createdBy: { name: 'John' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    const result = await createShoppingItem(validInput);

    expect(mockPrisma.shoppingItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 0 }),
      })
    );
  });

  it('returns error when name is missing', async () => {
    const invalidInput = {
      shoppingListId: mockListId,
      productId: mockProductId,
    };

    const result = await createShoppingItem(invalidInput as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockPrisma.shoppingItem.create).not.toHaveBeenCalled();
  });

  it('returns error when shopping list ID is missing', async () => {
    const invalidInput = {
      name: 'Apples',
      productId: mockProductId,
    };

    const result = await createShoppingItem(invalidInput as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error when shopping list not found', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(null);

    const result = await createShoppingItem(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Shopping list not found');
    expect(mockPrisma.shoppingItem.create).not.toHaveBeenCalled();
  });

  it('returns error when shopping list belongs to different household', async () => {
    const otherHouseholdList = {
      ...mockShoppingList,
      householdId: 'other-household',
    };
    mockPrisma.shoppingList.findFirst.mockResolvedValue(null);

    const result = await createShoppingItem(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Shopping list not found');
  });

  it('returns error on database failure', async () => {
    const dbError = new Error('Database connection failed');
    mockPrisma.shoppingList.findFirst.mockRejectedValue(dbError);

    const result = await createShoppingItem(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to create item');
  });

  it('includes household and user IDs in created item', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(mockShoppingList);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);
    mockPrisma.shoppingItem.create.mockResolvedValue({
      ...mockCreatedItem,
      createdBy: { name: 'John' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    const result = await createShoppingItem(validInput);

    expect(mockPrisma.shoppingItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          householdId: mockHouseholdId,
          createdById: mockUserId,
        }),
      })
    );
  });

  it('includes related data in response', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(mockShoppingList);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null);
    mockPrisma.shoppingItem.create.mockResolvedValue({
      ...mockCreatedItem,
      createdBy: { name: 'John Doe' },
      shoppingList: { name: 'Biedronka', emoji: '🛒' },
      product: { name: 'Apples', emoji: '🍎' },
    });

    const result = await createShoppingItem(validInput);

    expect(result.item).toHaveProperty('createdBy');
    expect(result.item).toHaveProperty('shoppingList');
    expect(result.item).toHaveProperty('product');
  });
});
