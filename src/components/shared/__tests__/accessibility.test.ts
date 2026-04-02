import { describe, it, expect } from 'vitest';
import { getAriaLabel, getAriaDescribedBy, isKeyboardEvent, KeyboardKeys, getAnnouncementText } from '@/app/lib/utils/accessibility';

describe('Accessibility utilities', () => {
  describe('getAriaLabel', () => {
    it('should generate aria-label from action', () => {
      const label = getAriaLabel('close');
      expect(label).toBe('Close');
    });

    it('should generate aria-label from action and context', () => {
      const label = getAriaLabel('close', 'modal');
      expect(label).toBe('Close modal');
    });

    it('should capitalize first letter', () => {
      const label = getAriaLabel('delete', 'item');
      expect(label).toBe('Delete item');
    });

    it('should handle single character action', () => {
      const label = getAriaLabel('x');
      expect(label).toBe('X');
    });
  });

  describe('getAriaDescribedBy', () => {
    it('should return undefined when no IDs provided', () => {
      const result = getAriaDescribedBy();
      expect(result).toBeUndefined();
    });

    it('should return only error ID', () => {
      const result = getAriaDescribedBy('error-123');
      expect(result).toBe('error-123');
    });

    it('should return only helper text ID', () => {
      const result = getAriaDescribedBy(undefined, 'helper-456');
      expect(result).toBe('helper-456');
    });

    it('should combine both IDs with space', () => {
      const result = getAriaDescribedBy('error-123', 'helper-456');
      expect(result).toBe('error-123 helper-456');
    });

    it('should filter out falsy values', () => {
      const result = getAriaDescribedBy('error-123', undefined);
      expect(result).toBe('error-123');
    });
  });

  describe('KeyboardKeys constants', () => {
    it.each([
      ['ESCAPE', 'Escape'],
      ['ENTER', 'Enter'],
      ['TAB', 'Tab'],
      ['SPACE', ' '],
      ['ARROW_UP', 'ArrowUp'],
      ['ARROW_DOWN', 'ArrowDown'],
      ['HOME', 'Home'],
      ['END', 'End'],
    ] as const)('KeyboardKeys.%s equals %s', (key, value) => {
      expect(KeyboardKeys[key as keyof typeof KeyboardKeys]).toBe(value);
    });
  });

  describe('isKeyboardEvent', () => {
    it.each([
      ['Escape', KeyboardKeys.ESCAPE, true],
      ['Enter', KeyboardKeys.ENTER, true],
      ['Tab', KeyboardKeys.TAB, true],
      ['a', KeyboardKeys.ESCAPE, false],
      ['escape', KeyboardKeys.ESCAPE, false],
    ])('isKeyboardEvent(key=%s, expected=%s) returns %s', (key, expected, result) => {
      const event = new KeyboardEvent('keydown', { key });
      expect(isKeyboardEvent(event, expected)).toBe(result);
    });
  });

  describe('getAnnouncementText', () => {
    it.each([
      ['Item deleted', undefined, 'Item deleted'],
      ['Item deleted', 1, 'Item deleted. 1 item.'],
      ['Items deleted', 5, 'Items deleted. 5 items.'],
      ['No items', 0, 'No items. 0 items.'],
    ])('getAnnouncementText(%s, %s) returns %s', (action, count, expected) => {
      expect(getAnnouncementText(action, count)).toBe(expected);
    });
  });
});
