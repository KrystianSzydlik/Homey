export function isNode(value: unknown): value is Node {
  return value instanceof Node;
}

export function isElement(value: unknown): value is Element {
  return value instanceof Element;
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function ensureNode(target: EventTarget | null | undefined): Node | null {
  return target && isNode(target) ? target : null;
}

export function ensureElement(
  target: EventTarget | null | undefined
): Element | null {
  return target && isElement(target) ? target : null;
}

export function ensureHTMLElement(
  target: EventTarget | null | undefined
): HTMLElement | null {
  return target && isHTMLElement(target) ? target : null;
}
