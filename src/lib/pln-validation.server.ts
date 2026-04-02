import { Decimal } from '@prisma/client/runtime/library';
import {
  PLN_DECIMAL_PLACES,
  PLN_MAX_VALUE,
  PlnValidationError,
} from '@/lib/pln-validation';

export function validatePlnPrice(
  value: number | string | Decimal | null | undefined,
  options: { allowNull?: boolean; autoCorrect?: boolean } = {}
): Decimal | null {
  const { allowNull = true, autoCorrect = false } = options;

  if (value === null || value === undefined) {
    if (allowNull) return null;
    throw new PlnValidationError('Price cannot be null or undefined');
  }

  let decimal: Decimal;
  try {
    decimal = new Decimal(value);
  } catch {
    throw new PlnValidationError(`Invalid price format: ${value}`);
  }

  if (decimal.isNegative()) {
    throw new PlnValidationError('Price cannot be negative');
  }

  if (!decimal.isFinite()) {
    throw new PlnValidationError('Price must be a finite number');
  }

  if (decimal.greaterThan(PLN_MAX_VALUE)) {
    throw new PlnValidationError(
      `Price exceeds maximum allowed value of ${PLN_MAX_VALUE.toLocaleString('pl-PL')} PLN`
    );
  }

  const decimalPlaces = decimal.decimalPlaces();
  if (decimalPlaces > PLN_DECIMAL_PLACES) {
    if (autoCorrect) {
      return decimal.toDecimalPlaces(
        PLN_DECIMAL_PLACES,
        Decimal.ROUND_HALF_EVEN
      );
    } else {
      throw new PlnValidationError(
        `Price has too many decimal places (${decimalPlaces}). PLN supports maximum ${PLN_DECIMAL_PLACES} decimal places (grosze)`
      );
    }
  }

  return decimal;
}
