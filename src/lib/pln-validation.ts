export const PLN_DECIMAL_PLACES = 2;
export const PLN_MAX_VALUE = 99999999.99;

export class PlnValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlnValidationError';
  }
}

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

export function parsePlnPrice(input: string): number | null {
  if (!input || typeof input !== 'string') return null;

  const cleaned = input
    .replace(/zł|PLN/gi, '')
    .replace(/\s/g, '')
    .trim();

  if (!cleaned) return null;

  const normalized = cleaned.replace(',', '.');

  const num = parseFloat(normalized);

  if (isNaN(num) || !isFinite(num)) return null;
  if (num < 0) return null;
  if (num > PLN_MAX_VALUE) return null;

  return Math.round(num * 100) / 100;
}
