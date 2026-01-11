export function parseQuantity(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '1';

  const parsed = parseFloat(trimmed);
  if (isNaN(parsed) || parsed <= 0) {
    return trimmed;
  }

  return parsed % 1 === 0 ? parsed.toString() : parsed.toFixed(2);
}

export function formatQuantityDisplay(quantity: string, unit?: string | null): string {
  const trimmedQuantity = quantity.trim();
  const trimmedUnit = unit?.trim();

  if (!trimmedQuantity) {
    return trimmedUnit || '';
  }

  if (!trimmedUnit) {
    return trimmedQuantity;
  }

  return `${trimmedQuantity} ${trimmedUnit}`;
}
