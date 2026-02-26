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
  };
  return { mockPrisma, mockGetSessionData };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.spyOn(authUtils, 'getSessionData').mockImplementation(() => mockGetSessionData());

describe('updateShoppingItemDetails', () => {
  const mockHouseholdId = 'household-123';
  const mockUserId = 'user-456';
  const mockItemId = 'clh1234567890item1';
  const mockSessionData = { householdId: mockHouseholdId, userId: mockUserId };

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
    lastPurchasedAt: new Date(),
    createdById: mockUserId,
    shoppingListId: 'list-123',
    productId: 'product-456',
  };

  beforeEach(() => {
    mockGetSessionData.mockResolvedValue(mockSessionData);
    mockPrisma.shoppingItem.findUnique.mockReset();
    mockPrisma.shoppingItem.update.mockReset();
    vi.spyOn(plnValidation, 'validatePlnPrice').mockReturnValue('10.50' as any);
  });

  it('successfully updates quantity and unit', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: mockHouseholdId,
      checked: false,
    });
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      quantity: '2',
      unit: 'pieces',
    });

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      quantity: '2',
      unit: 'pieces',
    });

    expect(result.success).toBe(true);
    expect(result.data?.quantity).toBe('2');
    expect(result.data?.unit).toBe('pieces');
  });

  it('successfully updates price', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: mockHouseholdId,
      checked: false,
    });
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      price: '15.99',
    });

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      price: 15.99,
    });

    expect(result.success).toBe(true);
  });

  it('successfully updates checked state', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: mockHouseholdId,
      checked: false,
    });
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      checked: true,
      purchasedAt: new Date(),
    });

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      checked: true,
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.shoppingItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ checked: true }),
      })
    );
  });

  it('sets purchasedAt when marking as checked', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: mockHouseholdId,
      checked: false,
    });
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      checked: true,
      purchasedAt: new Date(),
    });

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      checked: true,
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.shoppingItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ purchasedAt: expect.any(Date) }),
      })
    );
  });

  it('clears purchasedAt when unchecking', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: mockHouseholdId,
      checked: true,
    });
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      checked: false,
      purchasedAt: null,
    });

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      checked: false,
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.shoppingItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ purchasedAt: null }),
      })
    );
  });

  it('returns error for invalid item ID format', async () => {
    const result = await updateShoppingItemDetails({
      itemId: 'invalid-id',
      quantity: '2',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockPrisma.shoppingItem.findUnique).not.toHaveBeenCalled();
  });

  it('returns error when item not found', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue(null);

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      quantity: '2',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Item not found');
    expect(mockPrisma.shoppingItem.update).not.toHaveBeenCalled();
  });

  it('returns error for unauthorized access (different household)', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: 'different-household',
      checked: false,
    });

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      quantity: '2',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
    expect(mockPrisma.shoppingItem.update).not.toHaveBeenCalled();
  });

  it('returns error on database failure', async () => {
    mockPrisma.shoppingItem.findUnique.mockRejectedValue(
      new Error('Database connection failed')
    );

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      quantity: '2',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update item');
  });

  it('accepts null price to clear price', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: mockHouseholdId,
      checked: false,
    });
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      price: null,
    });

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      price: null,
    });

    expect(result.success).toBe(true);
  });

  it('verifies household isolation on update', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: mockHouseholdId,
      checked: false,
    });
    mockPrisma.shoppingItem.update.mockResolvedValue(mockItem);

    await updateShoppingItemDetails({
      itemId: mockItemId,
      quantity: '2',
    });

    expect(mockPrisma.shoppingItem.findUnique).toHaveBeenCalledWith({
      where: { id: mockItemId },
      select: { householdId: true, checked: true },
    });
  });

  it('updates multiple fields at once', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({
      householdId: mockHouseholdId,
      checked: false,
    });
    mockPrisma.shoppingItem.update.mockResolvedValue({
      ...mockItem,
      quantity: '3',
      unit: 'boxes',
      checked: true,
    });

    const result = await updateShoppingItemDetails({
      itemId: mockItemId,
      quantity: '3',
      unit: 'boxes',
      checked: true,
    });

    expect(result.success).toBe(true);
  });
});
