import { Decimal } from '@prisma/client/runtime/library';
import { PLN_DECIMAL_PLACES } from '@/lib/pln-validation';

/**
 * Recursively transforms Prisma Decimal types to numbers in a type-safe way.
 * - Decimal → number (with PLN-specific rounding)
 * - Date → Date (preserved)
 * - Arrays and nested objects are recursively transformed
 * - Preserves optional modifiers on object properties
 */
type SerializeDecimal<T> = T extends Decimal
  ? number
  : T extends Date
    ? Date
    : T extends Array<infer U>
      ? Array<SerializeDecimal<U>>
      : T extends object
        ? { [K in keyof T]: SerializeDecimal<T[K]> }
        : T;

/**
 * Serializes a Prisma Decimal to a number with PLN-specific rounding.
 * Uses banker's rounding (ROUND_HALF_EVEN) to minimize cumulative rounding errors.
 *
 * @example
 * serializePlnDecimal(new Decimal('12.345')) // 12.34
 * serializePlnDecimal(new Decimal('12.355')) // 12.36
 * serializePlnDecimal(new Decimal('12.365')) // 12.36 (banker's rounding)
 */
function serializePlnDecimal(decimal: Decimal): number {
  const rounded = decimal.toDecimalPlaces(
    PLN_DECIMAL_PLACES,
    Decimal.ROUND_HALF_EVEN
  );
  return Number(rounded.toFixed(PLN_DECIMAL_PLACES));
}

/**
 * Recursively serializes Prisma Decimal fields to numbers for JSON serialization.
 * Specifically designed for PLN currency with 2 decimal places (grosze).
 *
 * This is necessary because Prisma's Decimal type cannot be directly serialized to JSON
 * when passing data from Server Components to Client Components in Next.js.
 *
 * @param data - Any data structure potentially containing Decimal fields
 * @returns The same structure with Decimal fields converted to numbers
 *
 * @example
 * const lists = await prisma.shoppingList.findMany({ include: { items: true } });
 * const serialized = serializeDecimals(lists); // Safe to pass to client components
 */
export function serializeDecimals<T>(data: T): SerializeDecimal<T> {
  if (data === null || data === undefined) {
    return data as SerializeDecimal<T>;
  }

  if (data instanceof Decimal) {
    return serializePlnDecimal(data) as SerializeDecimal<T>;
  }

  if (data instanceof Date) {
    return data as SerializeDecimal<T>;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeDecimals(item)) as SerializeDecimal<T>;
  }

  if (typeof data === 'object') {
    if (data.constructor !== Object) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[serializeDecimals] Unexpected class instance encountered: ${data.constructor.name}. ` +
          'Only plain objects, Arrays, Dates, and Decimals are handled. ' +
          'This value will be passed through unchanged.'
        );
      }
      return data as SerializeDecimal<T>;
    }

    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeDecimals(value);
    }
    return serialized as SerializeDecimal<T>;
  }

  return data as SerializeDecimal<T>;
}
