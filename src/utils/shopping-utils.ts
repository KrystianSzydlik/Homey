export function parseQuantity(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '1';

  const parsed = parseFloat(trimmed);
  if (isNaN(parsed) || parsed <= 0) {
    return trimmed;
  }

  return parsed % 1 === 0 ? parsed.toString() : parsed.toFixed(2);
}

export interface ParsedQuantity {
  quantity: string;
  unit: string | null;
}

export function parseQuantityWithUnit(input: string): ParsedQuantity {
  const trimmed = input.trim();
  if (!trimmed) return { quantity: '1', unit: null };

  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (match) {
    return {
      quantity: match[1].replace(',', '.'),
      unit: match[2].trim() || null,
    };
  }
  return { quantity: trimmed, unit: null };
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
