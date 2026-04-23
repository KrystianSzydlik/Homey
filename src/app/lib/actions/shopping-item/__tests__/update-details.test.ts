import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateShoppingItemDetails } from '../update-details';
import * as authUtils from '@/app/lib/auth-utils';
import * as plnValidation from '@/lib/pln-validation.server';

const { mockPrisma, mockGetSessionData } = vi.hoisted(() => {
  const mockGetSessionData = vi.fn();
  const mockPrisma = {
    shoppingItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    purchaseRecord: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(mockPrisma)),
  };
  return { mockPrisma, mockGetSessionData };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('updateShoppingItemDetails', () => {
  const mockHouseholdId = 'household-123';
  const mockUserId = 'user-456';
  const mockItemId = 'clh1234567890item1';

  const mockItem = {
    id: mockItemId,
    name: 'Apples',
    quantity: '1',
    unit: 'kg',
    category: 'FRUITS' as const,
    emoji: '🍎',
    position: 0,
    note: null,
    checked: false,
    householdId: mockHouseholdId,
    createdById: mockUserId,
    shoppingListId: 'list-123',
    productId: 'clh1234567890prod1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(authUtils, 'getSessionData').mockImplementation(() => mockGetSessionData());
    mockGetSessionData.mockResolvedValue({ householdId: mockHouseholdId, userId: mockUserId });
    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => cb(mockPrisma)
    );
    vi.spyOn(plnValidation, 'validatePlnPrice').mockReturnValue('10.50' as any);
  });

  it('updates quantity and unit', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: false });
    mockPrisma.shoppingItem.update.mockResolvedValue({ ...mockItem, quantity: '2', unit: 'pieces' });

    const result = await updateShoppingItemDetails({ itemId: mockItemId, quantity: '2', unit: 'pieces' });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Expected success');
    expect(result.data?.quantity).toBe('2');
  });

  it('creates PurchaseRecord when item is checked', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: false });
    mockPrisma.shoppingItem.update.mockResolvedValue({ ...mockItem, checked: true });
    mockPrisma.product.findUnique.mockResolvedValue({ lastPurchasedAt: null, averageDaysBetweenPurchases: null });
    mockPrisma.purchaseRecord.create.mockResolvedValue({});
    mockPrisma.product.update.mockResolvedValue({});

    await updateShoppingItemDetails({ itemId: mockItemId, checked: true });

    expect(mockPrisma.purchaseRecord.create).toHaveBeenCalled();
  });

  it('does not create PurchaseRecord when item is unchecked', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: true });
    mockPrisma.shoppingItem.update.mockResolvedValue({ ...mockItem, checked: false });

    await updateShoppingItemDetails({ itemId: mockItemId, checked: false });

    expect(mockPrisma.purchaseRecord.create).not.toHaveBeenCalled();
  });

  it('accepts null price to clear price', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: false });
    mockPrisma.shoppingItem.update.mockResolvedValue(mockItem);

    const result = await updateShoppingItemDetails({ itemId: mockItemId, price: null });

    expect(result.success).toBe(true);
  });

  it('updates multiple fields at once', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: false });
    mockPrisma.shoppingItem.update.mockResolvedValue({ ...mockItem, quantity: '3', unit: 'boxes', checked: true });
    mockPrisma.product.findUnique.mockResolvedValue({ lastPurchasedAt: null, averageDaysBetweenPurchases: null });
    mockPrisma.purchaseRecord.create.mockResolvedValue({});
    mockPrisma.product.update.mockResolvedValue({});

    const result = await updateShoppingItemDetails({
      itemId: mockItemId, quantity: '3', unit: 'boxes', checked: true,
    });

    expect(result.success).toBe(true);
  });

  it('returns error for invalid item ID format', async () => {
    const result = await updateShoppingItemDetails({ itemId: 'invalid-id', quantity: '2' });

    expect(result.success).toBe(false);
    expect(mockPrisma.shoppingItem.findUnique).not.toHaveBeenCalled();
  });

  it('returns error when item not found', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue(null);

    const result = await updateShoppingItemDetails({ itemId: mockItemId, quantity: '2' });

    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected failure');
    expect(result.error).toBe('Item not found');
  });

  it('returns error for unauthorized access (different household)', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: 'different-household', checked: false });

    const result = await updateShoppingItemDetails({ itemId: mockItemId, quantity: '2' });

    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected failure');
    expect(result.error).toBe('Unauthorized');
  });

  it('returns error on database failure', async () => {
    mockPrisma.shoppingItem.findUnique.mockRejectedValue(new Error('DB error'));

    const result = await updateShoppingItemDetails({ itemId: mockItemId, quantity: '2' });

    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected failure');
    expect(result.error).toBe('Failed to update item');
  });
});
