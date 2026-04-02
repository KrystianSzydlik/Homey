import { Decimal } from '@prisma/client/runtime/library';
import { PLN_DECIMAL_PLACES } from '@/lib/pln-validation';

type SerializeDecimal<T> = T extends Decimal
  ? number
  : T extends Date
    ? Date
    : T extends Array<infer U>
      ? Array<SerializeDecimal<U>>
      : T extends object
        ? { [K in keyof T]: SerializeDecimal<T[K]> }
        : T;

function serializePlnDecimal(decimal: Decimal): number {
  const rounded = decimal.toDecimalPlaces(
    PLN_DECIMAL_PLACES,
    Decimal.ROUND_HALF_EVEN
  );
  return Number(rounded.toFixed(PLN_DECIMAL_PLACES));
}

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
