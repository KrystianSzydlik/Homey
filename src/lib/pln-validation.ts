export const PLN_DECIMAL_PLACES = 2;
export const PLN_MAX_VALUE = 99999999.99; // @db.Decimal(10, 2) means 10 total digits, 2 after decimal = 8 before

export class PlnValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlnValidationError';
  }
}

/**
 * Formats a price value for display in PLN
 * @param value - The price value to format
 * @param options - Formatting options
 * @returns Formatted string (e.g., "12,50 zł" or "12.50")
 */
export function formatPlnPrice(
  value: number | string | null | undefined,
  options: { includeCurrency?: boolean; locale?: string } = {}
): string {
  const { includeCurrency = true, locale = 'pl-PL' } = options;

  if (value === null || value === undefined) {
    return includeCurrency ? '0,00 zł' : '0,00';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return includeCurrency ? '0,00 zł' : '0,00';
  }

  if (includeCurrency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: PLN_DECIMAL_PLACES,
      maximumFractionDigits: PLN_DECIMAL_PLACES,
    }).format(num);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: PLN_DECIMAL_PLACES,
    maximumFractionDigits: PLN_DECIMAL_PLACES,
  }).format(num);
}

/**
 * Parses a PLN price string (handles both Polish and English formats)
 * @param input - String like "12,50", "12.50", "12,50 zł", etc.
 * @returns Number value or null if invalid
 */
export function parsePlnPrice(input: string): number | null {
  if (!input || typeof input !== 'string') return null;

  // Remove currency symbols and whitespace
  const cleaned = input
    .replace(/zł|PLN/gi, '')
    .replace(/\s/g, '')
    .trim();

  if (!cleaned) return null;

  // Handle Polish format (comma as decimal separator)
  const normalized = cleaned.replace(',', '.');

  const num = parseFloat(normalized);

  if (isNaN(num) || !isFinite(num)) return null;
  if (num < 0) return null;
  if (num > PLN_MAX_VALUE) return null;

  // Round to PLN decimal places
  return Math.round(num * 100) / 100;
}
