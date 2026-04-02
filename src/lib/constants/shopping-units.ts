export type UnitCategory = 'weight' | 'volume' | 'count' | 'container';

export interface Unit {
  id: string;
  category: UnitCategory;
  short: string;
  full: {
    one: string;
    few: string;
    many: string;
  };
  searchKeywords: string[];
}

export const UNITS: Unit[] = [
  {
    id: 'g',
    category: 'weight',
    short: 'g',
    full: { one: 'gram', few: 'gramy', many: 'gramów' },
    searchKeywords: ['gram', 'g'],
  },
  {
    id: 'dag',
    category: 'weight',
    short: 'dag',
    full: { one: 'dekagram', few: 'dekagramy', many: 'dekagramów' },
    searchKeywords: ['dekagram', 'dag'],
  },
  {
    id: 'kg',
    category: 'weight',
    short: 'kg',
    full: { one: 'kilogram', few: 'kilogramy', many: 'kilogramów' },
    searchKeywords: ['kilogram', 'kg', 'kilo'],
  },

  {
    id: 'ml',
    category: 'volume',
    short: 'ml',
    full: { one: 'mililitr', few: 'mililitry', many: 'mililitrów' },
    searchKeywords: ['mililitr', 'ml'],
  },
  {
    id: 'l',
    category: 'volume',
    short: 'l',
    full: { one: 'litr', few: 'litry', many: 'litrów' },
    searchKeywords: ['litr', 'l'],
  },

  {
    id: 'szt',
    category: 'count',
    short: 'szt',
    full: { one: 'sztuka', few: 'sztuki', many: 'sztuk' },
    searchKeywords: ['sztuka', 'szt', 'szt.'],
  },

  {
    id: 'opak',
    category: 'container',
    short: 'opak',
    full: { one: 'opakowanie', few: 'opakowania', many: 'opakowań' },
    searchKeywords: ['opakowanie', 'opak', 'paczka'],
  },
  {
    id: 'puszka',
    category: 'container',
    short: 'puszka',
    full: { one: 'puszka', few: 'puszki', many: 'puszek' },
    searchKeywords: ['puszka', 'konserwa'],
  },
  {
    id: 'słoik',
    category: 'container',
    short: 'słoik',
    full: { one: 'słoik', few: 'słoiki', many: 'słoików' },
    searchKeywords: ['słoik', 'słój'],
  },
];

export function getUnitLabel(unitId: string, quantity: number): string {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return unitId;

  const count = Math.abs(quantity);
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (count === 1) return unit.full.one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return unit.full.few;
  }

  return unit.full.many;
}

type UnitLabelFormat = 'short' | 'detailed';

const UNIT_GROUP_CONFIG: { label: string; category: UnitCategory }[] = [
  { label: 'Waga', category: 'weight' },
  { label: 'Objętość', category: 'volume' },
  { label: 'Ilość', category: 'count' },
  { label: 'Pojemniki', category: 'container' },
];

function formatUnitLabel(unit: Unit, format: UnitLabelFormat): string {
  return format === 'detailed'
    ? `${unit.short} (${unit.full.one})`
    : unit.short;
}

export function getUnitGroups(format: UnitLabelFormat = 'short') {
  return UNIT_GROUP_CONFIG.map(({ label, category }) => ({
    label,
    options: UNITS.filter((u) => u.category === category).map((u) => ({
      value: u.id,
      label: formatUnitLabel(u, format),
    })),
  }));
}
