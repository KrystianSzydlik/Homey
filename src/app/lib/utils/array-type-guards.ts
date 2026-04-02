export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isTruthy<T>(value: T | null | undefined | false | 0 | ''): value is T {
  return Boolean(value);
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}
