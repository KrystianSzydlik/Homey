/**
 * Polish pluralization helper.
 * Polish has 3 forms: singular (1), few (2-4), many (5+, and teens 12-14).
 *
 * Examples:
 *   pluralPl(1, 'produkt', 'produkty', 'produktów') → 'produkt'
 *   pluralPl(3, 'produkt', 'produkty', 'produktów') → 'produkty'
 *   pluralPl(5, 'produkt', 'produkty', 'produktów') → 'produktów'
 */
export function pluralPl(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  const lastDigit = abs % 10;
  const lastTwoDigits = abs % 100;

  if (n === 1) return one;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return few;
  return many;
}
