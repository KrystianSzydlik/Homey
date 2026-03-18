import { describe, it, expect } from 'vitest';
import {
  nameField,
  quantityField,
  unitField,
  categoryField,
  emojiField,
  shoppingListIdField,
  colorField,
  createShoppingItemSchema,
  updateShoppingItemSchema,
  createShoppingListSchema,
  updateShoppingListSchema,
  createProductSchema,
  searchQuerySchema,
  clearCheckedItemsSchema,
  itemIdSchema,
  listIdSchema,
  itemIdsSchema,
} from '../shopping-schemas';

const VALID_CATEGORIES = ['FRUITS', 'VEGETABLES', 'DAIRY', 'MEAT', 'BAKERY', 'FROZEN', 'DRINKS', 'CONDIMENTS', 'SWEETS', 'OTHER'];

describe('Shopping Validation Schemas', () => {
  describe('Field Validators - boundary tests', () => {
    it('nameField: accepts 1-100 chars, rejects empty and >100', () => {
      expect(nameField.safeParse('Apples').success).toBe(true);
      expect(nameField.safeParse('a'.repeat(100)).success).toBe(true);
      expect(nameField.safeParse('').success).toBe(false);
      expect(nameField.safeParse('a'.repeat(101)).success).toBe(false);
    });

    it('quantityField: accepts 0-20 chars including empty', () => {
      expect(quantityField.safeParse('2').success).toBe(true);
      expect(quantityField.safeParse('').success).toBe(true);
      expect(quantityField.safeParse('a'.repeat(21)).success).toBe(false);
    });

    it('unitField: accepts up to 20 chars', () => {
      expect(unitField.safeParse('kg').success).toBe(true);
      expect(unitField.safeParse('a'.repeat(21)).success).toBe(false);
    });

    it('categoryField: accepts all valid enum values, rejects invalid', () => {
      for (const cat of VALID_CATEGORIES) {
        expect(categoryField.safeParse(cat).success).toBe(true);
      }
      expect(categoryField.safeParse('INVALID').success).toBe(false);
      expect(categoryField.safeParse('fruits').success).toBe(false);
    });

    it('emojiField: accepts up to 10 chars', () => {
      expect(emojiField.safeParse('🍎').success).toBe(true);
      expect(emojiField.safeParse('🍎'.repeat(11)).success).toBe(false);
    });

    it('shoppingListIdField: rejects empty string', () => {
      expect(shoppingListIdField.safeParse('list-123').success).toBe(true);
      expect(shoppingListIdField.safeParse('').success).toBe(false);
    });

    it('colorField: accepts valid hex colors, rejects invalid', () => {
      expect(colorField.safeParse('#FF5733').success).toBe(true);
      expect(colorField.safeParse('#ff5733').success).toBe(true);
      expect(colorField.safeParse('000000').success).toBe(false);
      expect(colorField.safeParse('#FFF').success).toBe(false);
      expect(colorField.safeParse('#GGGGGG').success).toBe(false);
    });

    it('itemIdSchema and listIdSchema: accept CUID format', () => {
      expect(itemIdSchema.safeParse('clh1234567890item1').success).toBe(true);
      expect(itemIdSchema.safeParse('invalid-id').success).toBe(false);
      expect(listIdSchema.safeParse('clh1234567890list1').success).toBe(true);
      expect(listIdSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('Composed Schemas', () => {
    it('createShoppingItemSchema: requires name, shoppingListId, productId', () => {
      const full = { name: 'Apples', quantity: '2', unit: 'kg', category: 'FRUITS', emoji: '🍎', shoppingListId: 'clh1234567890list1', productId: 'prod-123' };
      const minimal = { name: 'Milk', shoppingListId: 'clh1234567890list1', productId: 'prod-456' };
      expect(createShoppingItemSchema.safeParse(full).success).toBe(true);
      expect(createShoppingItemSchema.safeParse(minimal).success).toBe(true);
      expect(createShoppingItemSchema.safeParse({ shoppingListId: 'clh1234567890list1', productId: 'prod-456' }).success).toBe(false);
      expect(createShoppingItemSchema.safeParse({ name: 'Apples', productId: 'prod-456' }).success).toBe(false);
      expect(createShoppingItemSchema.safeParse({ name: 'Apples', shoppingListId: 'clh1234567890list1' }).success).toBe(false);
    });

    it('updateShoppingItemSchema: all fields optional, validates category', () => {
      expect(updateShoppingItemSchema.safeParse({}).success).toBe(true);
      expect(updateShoppingItemSchema.safeParse({ name: 'Updated', checked: true }).success).toBe(true);
      expect(updateShoppingItemSchema.safeParse({ category: 'INVALID' }).success).toBe(false);
    });

    it('createShoppingListSchema: requires name (1-50 chars)', () => {
      expect(createShoppingListSchema.safeParse({ name: 'Biedronka', emoji: '🛒', color: '#FF5733' }).success).toBe(true);
      expect(createShoppingListSchema.safeParse({ name: 'Grocery Store' }).success).toBe(true);
      expect(createShoppingListSchema.safeParse({ emoji: '🛒' }).success).toBe(false);
      expect(createShoppingListSchema.safeParse({ name: '' }).success).toBe(false);
      expect(createShoppingListSchema.safeParse({ name: 'a'.repeat(51) }).success).toBe(false);
    });

    it('updateShoppingListSchema: all fields optional', () => {
      expect(updateShoppingListSchema.safeParse({}).success).toBe(true);
      expect(updateShoppingListSchema.safeParse({ name: 'Updated', emoji: '🏪' }).success).toBe(true);
    });

    it('createProductSchema: requires name, optional emoji/category/unit', () => {
      expect(createProductSchema.safeParse({ name: 'Apples', emoji: '🍎', defaultCategory: 'FRUITS', defaultUnit: 'kg' }).success).toBe(true);
      expect(createProductSchema.safeParse({ name: 'Apples' }).success).toBe(true);
      expect(createProductSchema.safeParse({ emoji: '🍎' }).success).toBe(false);
    });

    it('searchQuerySchema: 1-100 chars', () => {
      expect(searchQuerySchema.safeParse('apples').success).toBe(true);
      expect(searchQuerySchema.safeParse('a'.repeat(100)).success).toBe(true);
      expect(searchQuerySchema.safeParse('').success).toBe(false);
      expect(searchQuerySchema.safeParse('a'.repeat(101)).success).toBe(false);
    });

    it('clearCheckedItemsSchema: requires non-empty array of valid CUIDs', () => {
      expect(clearCheckedItemsSchema.safeParse({ itemIds: ['clh1234567890item1', 'clh1234567890item2'] }).success).toBe(true);
      expect(clearCheckedItemsSchema.safeParse({ itemIds: ['clh1234567890item1'] }).success).toBe(true);
      expect(clearCheckedItemsSchema.safeParse({ itemIds: [] }).success).toBe(false);
      expect(clearCheckedItemsSchema.safeParse({ itemIds: ['invalid-id'] }).success).toBe(false);
    });

    it('itemIdsSchema: requires non-empty array of CUIDs', () => {
      expect(itemIdsSchema.safeParse(['clh1234567890item1']).success).toBe(true);
      expect(itemIdsSchema.safeParse([]).success).toBe(false);
      expect(itemIdsSchema.safeParse(['invalid']).success).toBe(false);
    });
  });

  describe('Error messages', () => {
    it('nameField provides meaningful error messages', () => {
      const empty = nameField.safeParse('');
      expect(empty.success).toBe(false);
      if (!empty.success) expect(empty.error.issues[0]?.message).toContain('required');

      const tooLong = nameField.safeParse('a'.repeat(101));
      expect(tooLong.success).toBe(false);
      if (!tooLong.success) expect(tooLong.error.issues[0]?.message).toContain('long');
    });
  });
});
