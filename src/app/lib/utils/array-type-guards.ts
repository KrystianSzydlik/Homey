/**
 * Typed array filter utilities to safely eliminate null/undefined values.
 * Replaces unsafe `.filter(Boolean) as Type[]` pattern.
 */

/**
 * Type predicate for filtering out null/undefined values with proper type narrowing.
 * Use instead of `.filter(Boolean)`
 *
 * @example
 * const items = [{ id: '1' }, null, { id: '2' }];
 * const filtered = items.filter(isNotEmpty); // Type: ({ id: string })[]
 */
export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value != null;
}

/**
 * Type predicate for filtering falsy values (empty strings, 0, false, null, undefined)
 */
export function isTruthy<T>(value: T | null | undefined | false | 0 | ''): value is T {
  return Boolean(value);
}

/**
 * Type predicate combining type checking and truthiness.
 * Useful for optional properties.
 *
 * @example
 * interface Item { name?: string }
 * const items: Item[] = [{ name: 'test' }, {}, { name: undefined }];
 * const withNames = items.filter(item => hasProperty(item, 'name'));
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}
