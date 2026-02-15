import { Decimal } from '@prisma/client/runtime/library';

export const PLN_DECIMAL_PLACES = 2;
export const PLN_MAX_VALUE = 99999999.99; // @db.Decimal(10, 2) means 10 total digits, 2 after decimal = 8 before

export class PlnValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlnValidationError';
  }
}

/**
 * Validates and normalizes a PLN price value
 * @param value - The price value to validate (number, string, or Decimal)
 * @param options - Validation options
 * @returns Normalized Decimal value with exactly 2 decimal places
 * @throws PlnValidationError if value is invalid
 */
export function validatePlnPrice(
  value: number | string | Decimal | null | undefined,
  options: { allowNull?: boolean; autoCorrect?: boolean } = {}
): Decimal | null {
  const { allowNull = true, autoCorrect = false } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    if (allowNull) return null;
    throw new PlnValidationError('Price cannot be null or undefined');
  }

  // Convert to Decimal
  let decimal: Decimal;
  try {
    decimal = new Decimal(value);
  } catch {
    throw new PlnValidationError(`Invalid price format: ${value}`);
  }

  // Check for negative values
  if (decimal.isNegative()) {
    throw new PlnValidationError('Price cannot be negative');
  }

  // Check for NaN or Infinity
  if (!decimal.isFinite()) {
    throw new PlnValidationError('Price must be a finite number');
  }

  // Check maximum value (based on schema @db.Decimal(10, 2))
  if (decimal.greaterThan(PLN_MAX_VALUE)) {
    throw new PlnValidationError(
      `Price exceeds maximum allowed value of ${PLN_MAX_VALUE.toLocaleString('pl-PL')} PLN`
    );
  }

  // Check decimal places
  const decimalPlaces = decimal.decimalPlaces();
  if (decimalPlaces > PLN_DECIMAL_PLACES) {
    if (autoCorrect) {
      // Round using banker's rounding (round half to even)
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

/**
 * Formats a price value for display in PLN
 * @param value - The price value to format
 * @param options - Formatting options
 * @returns Formatted string (e.g., "12,50 zł" or "12.50")
 */
export function formatPlnPrice(
  value: number | string | Decimal | null | undefined,
  options: { includeCurrency?: boolean; locale?: string } = {}
): string {
  const { includeCurrency = true, locale = 'pl-PL' } = options;

  if (value === null || value === undefined) {
    return includeCurrency ? '0,00 zł' : '0,00';
  }

  const decimal = new Decimal(value);
  const formatted = decimal.toFixed(PLN_DECIMAL_PLACES);
  const number = Number(formatted);

  if (includeCurrency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: PLN_DECIMAL_PLACES,
      maximumFractionDigits: PLN_DECIMAL_PLACES,
    }).format(number);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: PLN_DECIMAL_PLACES,
    maximumFractionDigits: PLN_DECIMAL_PLACES,
  }).format(number);
}

/**
 * Parses a PLN price string (handles both Polish and English formats)
 * @param input - String like "12,50", "12.50", "12,50 zł", etc.
 * @returns Decimal value or null if invalid
 */
export function parsePlnPrice(input: string): Decimal | null {
  if (!input || typeof input !== 'string') return null;

  // Remove currency symbols and whitespace
  const cleaned = input
    .replace(/zł|PLN/gi, '')
    .replace(/\s/g, '')
    .trim();

  // Handle Polish format (comma as decimal separator)
  const normalized = cleaned.replace(',', '.');

  try {
    return validatePlnPrice(normalized, { autoCorrect: true });
  } catch {
    return null;
  }
}
