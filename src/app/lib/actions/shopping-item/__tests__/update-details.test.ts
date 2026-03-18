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
    mockGetSessionData.mockResolvedValue({ householdId: mockHouseholdId, userId: mockUserId });
    mockPrisma.shoppingItem.findUnique.mockReset();
    mockPrisma.shoppingItem.update.mockReset();
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

  it('sets purchasedAt when checking, clears when unchecking', async () => {
    // Check → sets purchasedAt
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: false });
    mockPrisma.shoppingItem.update.mockResolvedValue({ ...mockItem, checked: true, purchasedAt: new Date() });

    await updateShoppingItemDetails({ itemId: mockItemId, checked: true });
    expect(mockPrisma.shoppingItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ purchasedAt: expect.any(Date) }) })
    );

    // Uncheck → clears purchasedAt
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: true });
    mockPrisma.shoppingItem.update.mockResolvedValue({ ...mockItem, checked: false, purchasedAt: null });

    await updateShoppingItemDetails({ itemId: mockItemId, checked: false });
    expect(mockPrisma.shoppingItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ purchasedAt: null }) })
    );
  });

  it('accepts null price to clear price', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: false });
    mockPrisma.shoppingItem.update.mockResolvedValue({ ...mockItem, price: null });

    const result = await updateShoppingItemDetails({ itemId: mockItemId, price: null });
    expect(result.success).toBe(true);
  });

  it('updates multiple fields at once', async () => {
    mockPrisma.shoppingItem.findUnique.mockResolvedValue({ householdId: mockHouseholdId, checked: false });
    mockPrisma.shoppingItem.update.mockResolvedValue({ ...mockItem, quantity: '3', unit: 'boxes', checked: true });

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
