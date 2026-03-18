import { describe, it, expect } from 'vitest';
import { isNode, isElement, isHTMLElement, ensureNode, ensureElement, ensureHTMLElement } from '../dom-type-guards';

describe('DOM Type Guards', () => {
  const div = document.createElement('div');
  const textNode = document.createTextNode('test');
  const nonDomValues = [null, undefined, {} as any, 'string' as any, 123 as any];

  describe('type check functions', () => {
    it.each([
      ['isNode', isNode, div, true],
      ['isNode', isNode, textNode, true],
      ['isNode', isNode, document, true],
      ['isElement', isElement, div, true],
      ['isElement', isElement, textNode, false],
      ['isElement', isElement, document, false],
      ['isHTMLElement', isHTMLElement, div, true],
      ['isHTMLElement', isHTMLElement, textNode, false],
    ] as const)('%s(%s) returns %s', (_name, fn, input, expected) => {
      expect(fn(input)).toBe(expected);
    });

    it('all type guards return false for non-DOM values', () => {
      for (const val of nonDomValues) {
        expect(isNode(val)).toBe(false);
        expect(isElement(val)).toBe(false);
        expect(isHTMLElement(val)).toBe(false);
      }
    });
  });

  describe('ensure functions', () => {
    it('returns the value when type matches', () => {
      expect(ensureNode(div)).toBe(div);
      expect(ensureNode(textNode)).toBe(textNode);
      expect(ensureElement(div)).toBe(div);
      expect(ensureHTMLElement(div)).toBe(div);
    });

    it('returns null when type does not match', () => {
      expect(ensureElement(textNode)).toBe(null);
      expect(ensureHTMLElement(textNode)).toBe(null);
      for (const val of nonDomValues) {
        expect(ensureNode(val)).toBe(null);
        expect(ensureElement(val)).toBe(null);
        expect(ensureHTMLElement(val)).toBe(null);
      }
    });
  });

  describe('EventTarget narrowing', () => {
    it('safely narrows event.target to node', () => {
      const button = document.createElement('button');
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: button, enumerable: true });

      expect(ensureNode(event.target)).toBe(button);
    });

    it('handles null event.target', () => {
      const event = new MouseEvent('click', { bubbles: true });
      expect(ensureNode(event.target)).toBe(null);
    });
  });
});
