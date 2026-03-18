import { describe, it, expect } from 'vitest';
import {
  isShoppingCategory,
  ensureShoppingCategory,
  hasCatalogSource,
  hasHistorySource,
  hasSmartSource,
} from '../shopping-type-guards';

const VALID_CATEGORIES = ['VEGETABLES', 'DAIRY', 'MEAT', 'BAKERY', 'FRUITS', 'FROZEN', 'DRINKS', 'CONDIMENTS', 'SWEETS', 'OTHER'];

describe('isShoppingCategory', () => {
  it.each(VALID_CATEGORIES)('returns true for %s', (cat) => {
    expect(isShoppingCategory(cat)).toBe(true);
  });

  it.each(['INVALID', 'vegetables', '', 123, null, undefined, {}])(
    'returns false for %s',
    (val) => {
      expect(isShoppingCategory(val)).toBe(false);
    }
  );
});

describe('ensureShoppingCategory', () => {
  it('returns valid category as-is', () => {
    expect(ensureShoppingCategory('VEGETABLES')).toBe('VEGETABLES');
  });

  it('returns OTHER as default fallback for invalid input', () => {
    expect(ensureShoppingCategory('INVALID')).toBe('OTHER');
    expect(ensureShoppingCategory('')).toBe('OTHER');
  });

  it('uses custom fallback when provided', () => {
    expect(ensureShoppingCategory('INVALID', 'DAIRY')).toBe('DAIRY');
    expect(ensureShoppingCategory(null, 'MEAT')).toBe('MEAT');
  });
});

describe('Source type guards', () => {
  const makeSuggestion = (source: 'catalog' | 'history' | 'smart') => ({
    name: 'Test',
    emoji: '🥕',
    category: 'VEGETABLES' as const,
    source,
    ...(source === 'catalog' ? { id: 'test-id' } : {}),
    score: 0.8,
  });

  it.each([
    ['catalog', hasCatalogSource, true, false, false],
    ['history', hasHistorySource, false, true, false],
    ['smart', hasSmartSource, false, false, true],
  ] as const)('%s source is correctly identified', (source, _fn, isCatalog, isHistory, isSmart) => {
    const suggestion = makeSuggestion(source);
    expect(hasCatalogSource(suggestion)).toBe(isCatalog);
    expect(hasHistorySource(suggestion)).toBe(isHistory);
    expect(hasSmartSource(suggestion)).toBe(isSmart);
  });
});
