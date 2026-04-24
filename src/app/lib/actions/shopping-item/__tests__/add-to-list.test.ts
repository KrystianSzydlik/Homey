import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addProductToList } from '../add-to-list';

const { mockPrisma, mockGetSessionData } = vi.hoisted(() => ({
  mockGetSessionData: vi.fn(),
  mockPrisma: {
    shoppingList: { findFirst: vi.fn() },
    product: { findUnique: vi.fn() },
    shoppingItem: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/app/lib/auth-utils', () => ({ getSessionData: mockGetSessionData }));

const HOUSEHOLD_ID = 'household-123';
const USER_ID = 'user-456';
const LIST_ID = 'clh1234567890list1';
const PRODUCT_ID = 'clh1234567890prod1';

const mockProduct = {
  id: PRODUCT_ID,
  name: 'Milk',
  emoji: '🥛',
  defaultCategory: 'DAIRY',
  defaultUnit: 'liter',
};

describe('addProductToList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetSessionData.mockResolvedValue({ householdId: HOUSEHOLD_ID, userId: USER_ID });
    mockPrisma.shoppingList.findFirst.mockResolvedValue({ id: LIST_ID });
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.shoppingItem.findFirst.mockResolvedValue(null); // no duplicate
    mockPrisma.shoppingItem.create.mockResolvedValue({ id: 'new-item' });
  });

  it('creates item with product defaults', async () => {
    const result = await addProductToList({ productId: PRODUCT_ID, listId: LIST_ID });

    expect(result.success).toBe(true);
    expect(mockPrisma.shoppingItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Milk',
        emoji: '🥛',
        category: 'DAIRY',
        unit: 'liter',
        productId: PRODUCT_ID,
        shoppingListId: LIST_ID,
        householdId: HOUSEHOLD_ID,
        createdById: USER_ID,
      }),
    });
  });

  it('returns already_on_list when product has unchecked item on list', async () => {
    mockPrisma.shoppingItem.findFirst.mockResolvedValue({ id: 'existing-item' });

    const result = await addProductToList({ productId: PRODUCT_ID, listId: LIST_ID });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe('already_on_list');
    expect(mockPrisma.shoppingItem.create).not.toHaveBeenCalled();
  });

  it('returns error when list not in household', async () => {
    mockPrisma.shoppingList.findFirst.mockResolvedValue(null);

    const result = await addProductToList({ productId: PRODUCT_ID, listId: LIST_ID });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('List not found');
    expect(mockPrisma.shoppingItem.create).not.toHaveBeenCalled();
  });

  it('returns error when product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const result = await addProductToList({ productId: PRODUCT_ID, listId: LIST_ID });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('Product not found');
  });

  it('returns error for invalid CUID', async () => {
    const result = await addProductToList({ productId: 'not-a-cuid', listId: LIST_ID });

    expect(result.success).toBe(false);
    expect(mockPrisma.shoppingList.findFirst).not.toHaveBeenCalled();
  });

  it('assigns next position after last item', async () => {
    mockPrisma.shoppingItem.findFirst
      .mockResolvedValueOnce(null)           // duplicate check
      .mockResolvedValueOnce({ position: 4 }); // max position query

    await addProductToList({ productId: PRODUCT_ID, listId: LIST_ID });

    expect(mockPrisma.shoppingItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ position: 5 }),
    });
  });

  it('uses position 0 when list is empty', async () => {
    mockPrisma.shoppingItem.findFirst
      .mockResolvedValueOnce(null)  // duplicate check
      .mockResolvedValueOnce(null); // no items → no max position

    await addProductToList({ productId: PRODUCT_ID, listId: LIST_ID });

    expect(mockPrisma.shoppingItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ position: 0 }),
    });
  });
});
