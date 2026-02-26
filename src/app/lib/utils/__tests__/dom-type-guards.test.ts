import { describe, it, expect, beforeEach } from 'vitest';
import { isNode, isElement, isHTMLElement, ensureNode, ensureElement, ensureHTMLElement } from '../dom-type-guards';

describe('DOM Type Guards', () => {
  let div: HTMLDivElement;
  let span: HTMLSpanElement;

  beforeEach(() => {
    div = document.createElement('div');
    span = document.createElement('span');
  });

  describe('isNode', () => {
    it('returns true for DOM elements', () => {
      expect(isNode(div)).toBe(true);
      expect(isNode(span)).toBe(true);
    });

    it('returns true for text nodes', () => {
      const textNode = document.createTextNode('test');
      expect(isNode(textNode)).toBe(true);
    });

    it('returns true for document node', () => {
      expect(isNode(document)).toBe(true);
    });

    it('returns false for non-node values', () => {
      expect(isNode(null)).toBe(false);
      expect(isNode(undefined)).toBe(false);
      expect(isNode({})).toBe(false);
      expect(isNode('string')).toBe(false);
      expect(isNode(123)).toBe(false);
    });
  });

  describe('isElement', () => {
    it('returns true for HTML elements', () => {
      expect(isElement(div)).toBe(true);
      expect(isElement(span)).toBe(true);
    });

    it('returns false for text nodes', () => {
      const textNode = document.createTextNode('test');
      expect(isElement(textNode)).toBe(false);
    });

    it('returns false for document node', () => {
      expect(isElement(document)).toBe(false);
    });

    it('returns false for non-element values', () => {
      expect(isElement(null)).toBe(false);
      expect(isElement(undefined)).toBe(false);
      expect(isElement({})).toBe(false);
    });
  });

  describe('isHTMLElement', () => {
    it('returns true for HTML elements', () => {
      expect(isHTMLElement(div)).toBe(true);
      expect(isHTMLElement(span)).toBe(true);
    });

    it('returns false for text nodes', () => {
      const textNode = document.createTextNode('test');
      expect(isHTMLElement(textNode)).toBe(false);
    });

    it('returns false for null and undefined', () => {
      expect(isHTMLElement(null)).toBe(false);
      expect(isHTMLElement(undefined)).toBe(false);
    });

    it('returns false for non-DOM values', () => {
      expect(isHTMLElement({})).toBe(false);
      expect(isHTMLElement('string')).toBe(false);
      expect(isHTMLElement(123)).toBe(false);
    });
  });

  describe('ensureNode', () => {
    it('returns node when input is node', () => {
      const textNode = document.createTextNode('test');
      expect(ensureNode(textNode)).toBe(textNode);
      expect(ensureNode(div)).toBe(div);
    });

    it('returns null when input is not a node', () => {
      expect(ensureNode(null)).toBe(null);
      expect(ensureNode(undefined)).toBe(null);
      expect(ensureNode({})).toBe(null);
    });

    it('returns null for non-DOM values', () => {
      expect(ensureNode('string')).toBe(null);
      expect(ensureNode(123)).toBe(null);
    });
  });

  describe('ensureElement', () => {
    it('returns element when input is element', () => {
      expect(ensureElement(div)).toBe(div);
      expect(ensureElement(span)).toBe(span);
    });

    it('returns null when input is not element', () => {
      const textNode = document.createTextNode('test');
      expect(ensureElement(textNode)).toBe(null);
      expect(ensureElement(null)).toBe(null);
      expect(ensureElement(undefined)).toBe(null);
    });

    it('returns null for non-DOM values', () => {
      expect(ensureElement({})).toBe(null);
      expect(ensureElement('string')).toBe(null);
    });
  });

  describe('ensureHTMLElement', () => {
    it('returns HTML element when input is HTML element', () => {
      expect(ensureHTMLElement(div)).toBe(div);
      expect(ensureHTMLElement(span)).toBe(span);
    });

    it('returns null for non-HTML element nodes', () => {
      const textNode = document.createTextNode('test');
      expect(ensureHTMLElement(textNode)).toBe(null);
    });

    it('returns null for null and undefined', () => {
      expect(ensureHTMLElement(null)).toBe(null);
      expect(ensureHTMLElement(undefined)).toBe(null);
    });

    it('returns null for non-DOM values', () => {
      expect(ensureHTMLElement({})).toBe(null);
      expect(ensureHTMLElement('string')).toBe(null);
      expect(ensureHTMLElement(123)).toBe(null);
    });
  });

  describe('EventTarget narrowing (real-world usage)', () => {
    it('safely narrows event.target to node', () => {
      const button = document.createElement('button');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: button, enumerable: true });

      const node = ensureNode(clickEvent.target);
      expect(node).toBe(button);
    });

    it('handles null event.target', () => {
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const node = ensureNode(clickEvent.target);
      expect(node).toBe(null);
    });

    it('safely checks if clicked element is inside menu', () => {
      const menuRef = { current: div };
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: span, enumerable: true });

      const target = ensureNode(clickEvent.target);
      const isInside = target && menuRef.current?.contains(target);
      expect(isInside).toBe(false);
    });
  });
});
