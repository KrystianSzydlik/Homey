import { describe, it, expect } from 'vitest';
import {
  isShoppingCategory,
  ensureShoppingCategory,
  hasCatalogSource,
  hasHistorySource,
  hasSmartSource,
} from '../shopping-type-guards';

describe('isShoppingCategory', () => {
  it('returns true for valid category strings', () => {
    expect(isShoppingCategory('VEGETABLES')).toBe(true);
    expect(isShoppingCategory('DAIRY')).toBe(true);
    expect(isShoppingCategory('MEAT')).toBe(true);
    expect(isShoppingCategory('BAKERY')).toBe(true);
    expect(isShoppingCategory('FRUITS')).toBe(true);
    expect(isShoppingCategory('FROZEN')).toBe(true);
    expect(isShoppingCategory('DRINKS')).toBe(true);
    expect(isShoppingCategory('CONDIMENTS')).toBe(true);
    expect(isShoppingCategory('SWEETS')).toBe(true);
    expect(isShoppingCategory('OTHER')).toBe(true);
  });

  it('returns false for invalid category strings', () => {
    expect(isShoppingCategory('INVALID')).toBe(false);
    expect(isShoppingCategory('vegetables')).toBe(false);
    expect(isShoppingCategory('Dairy')).toBe(false);
    expect(isShoppingCategory('')).toBe(false);
  });

  it('returns false for non-string types', () => {
    expect(isShoppingCategory(123)).toBe(false);
    expect(isShoppingCategory(null)).toBe(false);
    expect(isShoppingCategory(undefined)).toBe(false);
    expect(isShoppingCategory({})).toBe(false);
    expect(isShoppingCategory([])).toBe(false);
  });

  it('returns false for boolean values', () => {
    expect(isShoppingCategory(true)).toBe(false);
    expect(isShoppingCategory(false)).toBe(false);
  });
});

describe('ensureShoppingCategory', () => {
  it('returns valid category when input is valid', () => {
    expect(ensureShoppingCategory('VEGETABLES')).toBe('VEGETABLES');
    expect(ensureShoppingCategory('OTHER')).toBe('OTHER');
  });

  it('returns fallback for invalid input', () => {
    expect(ensureShoppingCategory('INVALID')).toBe('OTHER');
    expect(ensureShoppingCategory('lowercase')).toBe('OTHER');
  });

  it('uses custom fallback when provided', () => {
    expect(ensureShoppingCategory('INVALID', 'DAIRY')).toBe('DAIRY');
    expect(ensureShoppingCategory(null, 'MEAT')).toBe('MEAT');
    expect(ensureShoppingCategory(undefined, 'FRUITS')).toBe('FRUITS');
  });

  it('returns custom fallback for non-string types', () => {
    expect(ensureShoppingCategory(123, 'DRINKS')).toBe('DRINKS');
    expect(ensureShoppingCategory({}, 'CONDIMENTS')).toBe('CONDIMENTS');
  });

  it('defaults to OTHER as fallback when not specified', () => {
    expect(ensureShoppingCategory('')).toBe('OTHER');
    expect(ensureShoppingCategory('INVALID')).toBe('OTHER');
  });
});

describe('Source type guards', () => {
  const catalogSuggestion = {
    name: 'Test',
    emoji: '🥕',
    category: 'VEGETABLES' as const,
    source: 'catalog' as const,
    id: 'test-id',
    score: 0.8,
  };

  const historySuggestion = {
    name: 'Test',
    emoji: '🥕',
    category: 'VEGETABLES' as const,
    source: 'history' as const,
    score: 0.8,
  };

  const smartSuggestion = {
    name: 'Test',
    emoji: '🥕',
    category: 'VEGETABLES' as const,
    source: 'smart' as const,
    score: 0.8,
  };

  describe('hasCatalogSource', () => {
    it('returns true for catalog source', () => {
      expect(hasCatalogSource(catalogSuggestion)).toBe(true);
    });

    it('returns false for history source', () => {
      expect(hasCatalogSource(historySuggestion)).toBe(false);
    });

    it('returns false for smart source', () => {
      expect(hasCatalogSource(smartSuggestion)).toBe(false);
    });

    it('narrows type correctly for catalog suggestions', () => {
      const suggestion = catalogSuggestion;
      if (hasCatalogSource(suggestion)) {
        expect(suggestion.id).toBeDefined();
      }
    });
  });

  describe('hasHistorySource', () => {
    it('returns true for history source', () => {
      expect(hasHistorySource(historySuggestion)).toBe(true);
    });

    it('returns false for catalog source', () => {
      expect(hasHistorySource(catalogSuggestion)).toBe(false);
    });

    it('returns false for smart source', () => {
      expect(hasHistorySource(smartSuggestion)).toBe(false);
    });
  });

  describe('hasSmartSource', () => {
    it('returns true for smart source', () => {
      expect(hasSmartSource(smartSuggestion)).toBe(true);
    });

    it('returns false for catalog source', () => {
      expect(hasSmartSource(catalogSuggestion)).toBe(false);
    });

    it('returns false for history source', () => {
      expect(hasSmartSource(historySuggestion)).toBe(false);
    });
  });
});
