import { ShoppingCategory, Product, ShoppingItem } from '@prisma/client';
import {
  ShoppingItemWithCreator,
  ShoppingListWithItems,
  ShoppingListWithCreator,
} from '@/types/shopping';

export function createMockShoppingItem(
  overrides: Partial<ShoppingItemWithCreator> = {}
): ShoppingItemWithCreator {
  return {
    id: 'clh1234567890item1',
    name: 'Test Item',
    quantity: '1',
    unit: null,
    category: 'OTHER' as ShoppingCategory,
    checked: false,
    position: 0,
    emoji: null,
    price: null,
    currency: 'PLN',
    purchasedAt: null,
    purchaseCount: 0,
    lastPurchasedAt: null,
    averageDaysBetweenPurchases: null,
    shoppingListId: 'clh1234567890list1',
    productId: 'clh1234567890prod1',
    householdId: 'clh1234567890hous1',
    createdById: 'clh1234567890user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: { name: 'Test User' },
    shoppingList: { name: 'Test List', emoji: null },
    product: null,
    ...overrides,
  };
}

export function createMockShoppingItemRecord(
  overrides: Partial<ShoppingItem> = {}
): ShoppingItem {
  return {
    id: 'clh1234567890item1',
    name: 'Test Item',
    quantity: '1',
    unit: null,
    category: 'OTHER' as ShoppingCategory,
    checked: false,
    position: 0,
    emoji: null,
    currency: 'PLN',
    price: null,
    purchasedAt: null,
    purchaseCount: 0,
    lastPurchasedAt: null,
    averageDaysBetweenPurchases: null,
    shoppingListId: 'clh1234567890list1',
    productId: 'clh1234567890prod1',
    householdId: 'clh1234567890hous1',
    createdById: 'clh1234567890user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockShoppingList(
  overrides: Partial<ShoppingListWithItems> = {}
): ShoppingListWithItems {
  return {
    id: 'clh1234567890list1',
    name: 'Test List',
    emoji: '🛒',
    color: null,
    householdId: 'clh1234567890hous1',
    createdById: 'clh1234567890user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    position: 0,
    isDefault: false,
    items: [],
    createdBy: { name: 'Test User' },
    _count: { items: 0 },
    ...overrides,
  };
}

export function createMockShoppingListWithCreator(
  overrides: Partial<ShoppingListWithCreator> = {}
): ShoppingListWithCreator {
  return {
    id: 'clh1234567890list1',
    name: 'Test List',
    emoji: '🛒',
    color: null,
    householdId: 'clh1234567890hous1',
    createdById: 'clh1234567890user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    position: 0,
    isDefault: false,
    createdBy: { name: 'Test User' },
    _count: { items: 0 },
    ...overrides,
  };
}
export function createMockProduct(
  overrides: Partial<Product> = {}
): Product {
  return {
    id: 'clh1234567890prod1',
    name: 'Test Product',
    emoji: '🛒',
    defaultCategory: 'OTHER' as ShoppingCategory,
    defaultUnit: null,
    usageCount: 0,
    lastUsedAt: null,
    householdId: 'clh1234567890hous1',
    createdById: 'clh1234567890user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}
