import { describe, it, expect } from 'vitest';
import {
  nameField,
  quantityField,
  unitField,
  categoryField,
  emojiField,
  shoppingListIdField,
  productIdField,
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

describe('Shopping Validation Schemas', () => {
  describe('Field Validators', () => {
    describe('nameField', () => {
      it('accepts valid name', () => {
        expect(nameField.safeParse('Apples').success).toBe(true);
        expect(nameField.safeParse('Product Name').success).toBe(true);
      });

      it('rejects empty string', () => {
        expect(nameField.safeParse('').success).toBe(false);
      });

      it('rejects names over 100 characters', () => {
        const longName = 'a'.repeat(101);
        expect(nameField.safeParse(longName).success).toBe(false);
      });

      it('accepts exactly 100 characters', () => {
        const name100 = 'a'.repeat(100);
        expect(nameField.safeParse(name100).success).toBe(true);
      });

      it('rejects non-string values', () => {
        expect(nameField.safeParse(123).success).toBe(false);
        expect(nameField.safeParse(null).success).toBe(false);
      });
    });

    describe('quantityField', () => {
      it('accepts valid quantity', () => {
        expect(quantityField.safeParse('2').success).toBe(true);
        expect(quantityField.safeParse('1.5').success).toBe(true);
        expect(quantityField.safeParse('10').success).toBe(true);
      });

      it('rejects quantities over 20 characters', () => {
        const longQuantity = 'a'.repeat(21);
        expect(quantityField.safeParse(longQuantity).success).toBe(false);
      });

      it('accepts empty string', () => {
        expect(quantityField.safeParse('').success).toBe(true);
      });
    });

    describe('unitField', () => {
      it('accepts valid units', () => {
        expect(unitField.safeParse('kg').success).toBe(true);
        expect(unitField.safeParse('ml').success).toBe(true);
        expect(unitField.safeParse('pieces').success).toBe(true);
      });

      it('rejects units over 20 characters', () => {
        const longUnit = 'a'.repeat(21);
        expect(unitField.safeParse(longUnit).success).toBe(false);
      });
    });

    describe('categoryField', () => {
      it('accepts valid categories', () => {
        expect(categoryField.safeParse('FRUITS').success).toBe(true);
        expect(categoryField.safeParse('VEGETABLES').success).toBe(true);
        expect(categoryField.safeParse('DAIRY').success).toBe(true);
        expect(categoryField.safeParse('MEAT').success).toBe(true);
        expect(categoryField.safeParse('BAKERY').success).toBe(true);
        expect(categoryField.safeParse('FROZEN').success).toBe(true);
        expect(categoryField.safeParse('DRINKS').success).toBe(true);
        expect(categoryField.safeParse('CONDIMENTS').success).toBe(true);
        expect(categoryField.safeParse('SWEETS').success).toBe(true);
        expect(categoryField.safeParse('OTHER').success).toBe(true);
      });

      it('rejects invalid categories', () => {
        expect(categoryField.safeParse('INVALID').success).toBe(false);
        expect(categoryField.safeParse('fruits').success).toBe(false);
        expect(categoryField.safeParse('').success).toBe(false);
      });
    });

    describe('emojiField', () => {
      it('accepts valid emojis', () => {
        expect(emojiField.safeParse('🍎').success).toBe(true);
        expect(emojiField.safeParse('🥕').success).toBe(true);
        expect(emojiField.safeParse('🛒').success).toBe(true);
      });

      it('rejects emojis over 10 characters', () => {
        const longEmoji = '🍎'.repeat(11);
        expect(emojiField.safeParse(longEmoji).success).toBe(false);
      });

      it('accepts multiple emojis within limit', () => {
        expect(emojiField.safeParse('🍎🥕').success).toBe(true);
      });
    });

    describe('shoppingListIdField', () => {
      it('accepts non-empty string', () => {
        expect(shoppingListIdField.safeParse('list-123').success).toBe(true);
      });

      it('rejects empty string', () => {
        expect(shoppingListIdField.safeParse('').success).toBe(false);
      });

      it('rejects non-string values', () => {
        expect(shoppingListIdField.safeParse(null).success).toBe(false);
      });
    });

    describe('colorField', () => {
      it('accepts valid hex colors', () => {
        expect(colorField.safeParse('#000000').success).toBe(true);
        expect(colorField.safeParse('#FFFFFF').success).toBe(true);
        expect(colorField.safeParse('#FF5733').success).toBe(true);
        expect(colorField.safeParse('#ff5733').success).toBe(true);
      });

      it('rejects invalid hex colors', () => {
        expect(colorField.safeParse('000000').success).toBe(false);
        expect(colorField.safeParse('#FFF').success).toBe(false);
        expect(colorField.safeParse('#GGGGGG').success).toBe(false);
      });
    });

    describe('itemIdSchema', () => {
      it('accepts valid CUID format', () => {
        expect(itemIdSchema.safeParse('clh1234567890item1').success).toBe(true);
      });

      it('rejects non-CUID format', () => {
        expect(itemIdSchema.safeParse('invalid-id').success).toBe(false);
        expect(itemIdSchema.safeParse('123').success).toBe(false);
      });
    });

    describe('listIdSchema', () => {
      it('accepts valid CUID format', () => {
        expect(listIdSchema.safeParse('clh1234567890list1').success).toBe(true);
      });

      it('rejects non-CUID format', () => {
        expect(listIdSchema.safeParse('invalid-list-id').success).toBe(false);
      });
    });
  });

  describe('Complex Schemas', () => {
    describe('createShoppingItemSchema', () => {
      it('accepts valid item with all fields', () => {
        const validItem = {
          name: 'Apples',
          quantity: '2',
          unit: 'kg',
          category: 'FRUITS',
          emoji: '🍎',
          shoppingListId: 'clh1234567890list1',
          productId: 'prod-123',
        };
        expect(createShoppingItemSchema.safeParse(validItem).success).toBe(true);
      });

      it('accepts valid item with required fields only', () => {
        const minimalItem = {
          name: 'Milk',
          shoppingListId: 'clh1234567890list1',
          productId: 'prod-456',
        };
        expect(createShoppingItemSchema.safeParse(minimalItem).success).toBe(true);
      });

      it('rejects item without name', () => {
        const invalidItem = {
          shoppingListId: 'clh1234567890list1',
          productId: 'prod-456',
        };
        expect(createShoppingItemSchema.safeParse(invalidItem).success).toBe(false);
      });

      it('rejects item without shopping list ID', () => {
        const invalidItem = {
          name: 'Apples',
          productId: 'prod-456',
        };
        expect(createShoppingItemSchema.safeParse(invalidItem).success).toBe(false);
      });

      it('rejects item without product ID', () => {
        const invalidItem = {
          name: 'Apples',
          shoppingListId: 'clh1234567890list1',
        };
        expect(createShoppingItemSchema.safeParse(invalidItem).success).toBe(false);
      });

      it('accepts item with invalid category enum by omitting it', () => {
        const itemWithoutCategory = {
          name: 'Apples',
          shoppingListId: 'clh1234567890list1',
          productId: 'prod-456',
        };
        expect(createShoppingItemSchema.safeParse(itemWithoutCategory).success).toBe(true);
      });
    });

    describe('updateShoppingItemSchema', () => {
      it('accepts empty object (all fields optional)', () => {
        expect(updateShoppingItemSchema.safeParse({}).success).toBe(true);
      });

      it('accepts partial update', () => {
        const partialUpdate = {
          name: 'Updated Name',
        };
        expect(updateShoppingItemSchema.safeParse(partialUpdate).success).toBe(true);
      });

      it('accepts checked flag', () => {
        const updateWithChecked = {
          checked: true,
        };
        expect(updateShoppingItemSchema.safeParse(updateWithChecked).success).toBe(true);
      });

      it('rejects invalid category in update', () => {
        const invalidUpdate = {
          category: 'INVALID',
        };
        expect(updateShoppingItemSchema.safeParse(invalidUpdate).success).toBe(false);
      });
    });

    describe('createShoppingListSchema', () => {
      it('accepts valid list with all fields', () => {
        const validList = {
          name: 'Biedronka',
          emoji: '🛒',
          color: '#FF5733',
        };
        expect(createShoppingListSchema.safeParse(validList).success).toBe(true);
      });

      it('accepts list with name only', () => {
        const minimalList = {
          name: 'Grocery Store',
        };
        expect(createShoppingListSchema.safeParse(minimalList).success).toBe(true);
      });

      it('rejects list without name', () => {
        const invalidList = {
          emoji: '🛒',
        };
        expect(createShoppingListSchema.safeParse(invalidList).success).toBe(false);
      });

      it('rejects list with empty name', () => {
        const invalidList = {
          name: '',
          emoji: '🛒',
        };
        expect(createShoppingListSchema.safeParse(invalidList).success).toBe(false);
      });

      it('rejects list with name over 50 characters', () => {
        const invalidList = {
          name: 'a'.repeat(51),
          emoji: '🛒',
        };
        expect(createShoppingListSchema.safeParse(invalidList).success).toBe(false);
      });

      it('accepts list with invalid color by omitting it', () => {
        const listWithoutColor = {
          name: 'My List',
        };
        expect(createShoppingListSchema.safeParse(listWithoutColor).success).toBe(true);
      });
    });

    describe('updateShoppingListSchema', () => {
      it('accepts empty object (all optional)', () => {
        expect(updateShoppingListSchema.safeParse({}).success).toBe(true);
      });

      it('accepts partial name update', () => {
        const partialUpdate = {
          name: 'Updated List Name',
        };
        expect(updateShoppingListSchema.safeParse(partialUpdate).success).toBe(true);
      });

      it('accepts emoji update', () => {
        const emojiUpdate = {
          emoji: '🏪',
        };
        expect(updateShoppingListSchema.safeParse(emojiUpdate).success).toBe(true);
      });
    });

    describe('createProductSchema', () => {
      it('accepts valid product with all fields', () => {
        const validProduct = {
          name: 'Fresh Apples',
          emoji: '🍎',
          defaultCategory: 'FRUITS',
          defaultUnit: 'kg',
        };
        expect(createProductSchema.safeParse(validProduct).success).toBe(true);
      });

      it('accepts product with name only', () => {
        const minimalProduct = {
          name: 'Apples',
        };
        expect(createProductSchema.safeParse(minimalProduct).success).toBe(true);
      });

      it('rejects product without name', () => {
        const invalidProduct = {
          emoji: '🍎',
        };
        expect(createProductSchema.safeParse(invalidProduct).success).toBe(false);
      });
    });

    describe('searchQuerySchema', () => {
      it('accepts valid search query', () => {
        expect(searchQuerySchema.safeParse('apples').success).toBe(true);
        expect(searchQuerySchema.safeParse('fresh apples').success).toBe(true);
      });

      it('rejects empty search query', () => {
        expect(searchQuerySchema.safeParse('').success).toBe(false);
      });

      it('rejects query over 100 characters', () => {
        const longQuery = 'a'.repeat(101);
        expect(searchQuerySchema.safeParse(longQuery).success).toBe(false);
      });

      it('accepts exactly 100 characters', () => {
        const query100 = 'a'.repeat(100);
        expect(searchQuerySchema.safeParse(query100).success).toBe(true);
      });
    });

    describe('clearCheckedItemsSchema', () => {
      it('accepts valid array of item IDs', () => {
        const validClear = {
          itemIds: ['clh1234567890item1', 'clh1234567890item2'],
        };
        expect(clearCheckedItemsSchema.safeParse(validClear).success).toBe(true);
      });

      it('accepts single item ID', () => {
        const singleItem = {
          itemIds: ['clh1234567890item1'],
        };
        expect(clearCheckedItemsSchema.safeParse(singleItem).success).toBe(true);
      });

      it('rejects empty array', () => {
        const emptyArray = {
          itemIds: [],
        };
        expect(clearCheckedItemsSchema.safeParse(emptyArray).success).toBe(false);
      });

      it('rejects invalid CUID in array', () => {
        const invalidArray = {
          itemIds: ['invalid-id', 'clh1234567890item2'],
        };
        expect(clearCheckedItemsSchema.safeParse(invalidArray).success).toBe(false);
      });
    });

    describe('itemIdsSchema', () => {
      it('accepts array with valid CUIDs', () => {
        const validIds = ['clh1234567890item1', 'clh1234567890item2'];
        expect(itemIdsSchema.safeParse(validIds).success).toBe(true);
      });

      it('rejects empty array', () => {
        expect(itemIdsSchema.safeParse([]).success).toBe(false);
      });

      it('rejects array with invalid CUID format', () => {
        const invalidIds = ['invalid-id', 'clh1234567890item2'];
        expect(itemIdsSchema.safeParse(invalidIds).success).toBe(false);
      });
    });
  });

  describe('Schema Error Messages', () => {
    it('nameField provides clear error for empty string', () => {
      const result = nameField.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('required');
      }
    });

    it('nameField provides clear error for too long name', () => {
      const result = nameField.safeParse('a'.repeat(101));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('long');
      }
    });

    it('createShoppingListSchema provides clear error for empty name', () => {
      const result = createShoppingListSchema.safeParse({
        name: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBeDefined();
      }
    });
  });
});
