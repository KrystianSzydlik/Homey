import { ShoppingCategory } from '@prisma/client';

export interface ProductDefaults {
  category: ShoppingCategory;
  emoji: string;
}

const PRODUCT_MAPPING: Record<string, ProductDefaults> = {
  cebula: { category: 'VEGETABLES', emoji: '🧅' },
  czosnek: { category: 'VEGETABLES', emoji: '🧄' },
  pomidor: { category: 'VEGETABLES', emoji: '🍅' },
  ogórek: { category: 'VEGETABLES', emoji: '🥒' },
  ziemniak: { category: 'VEGETABLES', emoji: '🥔' },
  marchew: { category: 'VEGETABLES', emoji: '🥕' },
  sałata: { category: 'VEGETABLES', emoji: '🥬' },
  brokuł: { category: 'VEGETABLES', emoji: '🥦' },
  papryka: { category: 'VEGETABLES', emoji: '🫑' },
  kukurydza: { category: 'VEGETABLES', emoji: '🌽' },
  bakłażan: { category: 'VEGETABLES', emoji: '🍆' },
  cukinia: { category: 'VEGETABLES', emoji: '🥒' },
  kabaczek: { category: 'VEGETABLES', emoji: '🥒' },
  kapusta: { category: 'VEGETABLES', emoji: '🥬' },
  kalafior: { category: 'VEGETABLES', emoji: '🥦' },
  rzodkiewka: { category: 'VEGETABLES', emoji: '🥗' },
  szpinak: { category: 'VEGETABLES', emoji: '🥬' },
  imbir: { category: 'VEGETABLES', emoji: '🫚' },
  kurkuma: { category: 'VEGETABLES', emoji: '🫚' },
  topinambur: { category: 'VEGETABLES', emoji: '🥔' },
  pietruszka: { category: 'VEGETABLES', emoji: '🌿' },
  koper: { category: 'VEGETABLES', emoji: '🌿' },
  fasola: { category: 'VEGETABLES', emoji: '🫛' },
  groszek: { category: 'VEGETABLES', emoji: '🫛' },
  szparagi: { category: 'VEGETABLES', emoji: '🥗' },
  batat: { category: 'VEGETABLES', emoji: '🥔' },
  dynia: { category: 'VEGETABLES', emoji: '🎃' },

  jabłko: { category: 'FRUITS', emoji: '🍎' },
  banan: { category: 'FRUITS', emoji: '🍌' },
  gruszka: { category: 'FRUITS', emoji: '🍐' },
  pomarańcza: { category: 'FRUITS', emoji: '🍊' },
  cytryna: { category: 'FRUITS', emoji: '🍋' },
  truskawka: { category: 'FRUITS', emoji: '🍓' },
  borówka: { category: 'FRUITS', emoji: '🫐' },
  jagoda: { category: 'FRUITS', emoji: '🫐' },
  malina: { category: 'FRUITS', emoji: '🍓' },
  winogrona: { category: 'FRUITS', emoji: '🍇' },
  arbuz: { category: 'FRUITS', emoji: '🍉' },
  melon: { category: 'FRUITS', emoji: '🍈' },
  brzoskwinia: { category: 'FRUITS', emoji: '🍑' },
  śliwka: { category: 'FRUITS', emoji: '🍑' },
  wiśnia: { category: 'FRUITS', emoji: '🍒' },
  czereśnia: { category: 'FRUITS', emoji: '🍒' },
  kiwi: { category: 'FRUITS', emoji: '🥝' },
  ananas: { category: 'FRUITS', emoji: '🍍' },
  mango: { category: 'FRUITS', emoji: '🥭' },
  awokado: { category: 'FRUITS', emoji: '🥑' },

  chleb: { category: 'BAKERY', emoji: '🍞' },
  bułka: { category: 'BAKERY', emoji: '🥖' },
  bagietka: { category: 'BAKERY', emoji: '🥖' },
  rogal: { category: 'BAKERY', emoji: '🥐' },
  pączek: { category: 'BAKERY', emoji: '🍩' },
  drożdżówka: { category: 'BAKERY', emoji: '🥐' },
  ciasto: { category: 'BAKERY', emoji: '🍰' },
  tarta: { category: 'BAKERY', emoji: '🥧' },

  mleko: { category: 'DAIRY', emoji: '🥛' },
  ser: { category: 'DAIRY', emoji: '🧀' },
  twaróg: { category: 'DAIRY', emoji: '🧀' },
  jogurt: { category: 'DAIRY', emoji: '🍦' },
  masło: { category: 'DAIRY', emoji: '🧈' },
  śmietana: { category: 'DAIRY', emoji: '🥛' },
  jajka: { category: 'DAIRY', emoji: '🥚' },
  jajko: { category: 'DAIRY', emoji: '🥚' },

  kurczak: { category: 'MEAT', emoji: '🍗' },
  indyk: { category: 'MEAT', emoji: '🍗' },
  wołowina: { category: 'MEAT', emoji: '🥩' },
  wieprzowina: { category: 'MEAT', emoji: '🥩' },
  mięso: { category: 'MEAT', emoji: '🥩' },
  schab: { category: 'MEAT', emoji: '🥩' },
  kiełbasa: { category: 'MEAT', emoji: '🌭' },
  szynka: { category: 'MEAT', emoji: '🥓' },
  boczek: { category: 'MEAT', emoji: '🥓' },
  ryba: { category: 'MEAT', emoji: '🐟' },
  łosoś: { category: 'MEAT', emoji: '🐟' },
  tuńczyk: { category: 'MEAT', emoji: '🐟' },
  krewetki: { category: 'MEAT', emoji: '🍤' },

  woda: { category: 'DRINKS', emoji: '💧' },
  sok: { category: 'DRINKS', emoji: '🧃' },
  kawa: { category: 'DRINKS', emoji: '☕' },
  herbata: { category: 'DRINKS', emoji: '🍵' },
  piwo: { category: 'DRINKS', emoji: '🍺' },
  wino: { category: 'DRINKS', emoji: '🍷' },
  napój: { category: 'DRINKS', emoji: '🥤' },
  cola: { category: 'DRINKS', emoji: '🥤' },

  czekolada: { category: 'SWEETS', emoji: '🍫' },
  baton: { category: 'SWEETS', emoji: '🍫' },
  ciastka: { category: 'SWEETS', emoji: '🍪' },
  chipsy: { category: 'SWEETS', emoji: '🍟' },
  orzechy: { category: 'SWEETS', emoji: '🥜' },
  lody: { category: 'SWEETS', emoji: '🍦' },
  miód: { category: 'SWEETS', emoji: '🍯' },

  sól: { category: 'CONDIMENTS', emoji: '🧂' },
  pieprz: { category: 'CONDIMENTS', emoji: '🧂' },
  cukier: { category: 'CONDIMENTS', emoji: '🧂' },
  olej: { category: 'CONDIMENTS', emoji: '🫗' },
  oliwa: { category: 'CONDIMENTS', emoji: '🫗' },
  mąka: { category: 'CONDIMENTS', emoji: '🌾' },
  ryż: { category: 'CONDIMENTS', emoji: '🍚' },
  makaron: { category: 'CONDIMENTS', emoji: '🍝' },
  płatki: { category: 'CONDIMENTS', emoji: '🥣' },
  sos: { category: 'CONDIMENTS', emoji: '🥫' },
  ketchup: { category: 'CONDIMENTS', emoji: '🥫' },
  musztarda: { category: 'CONDIMENTS', emoji: '🥫' },

  mrożonka: { category: 'FROZEN', emoji: '❄️' },
  pizza: { category: 'FROZEN', emoji: '🍕' },
  frytki: { category: 'FROZEN', emoji: '🍟' },
};

const CATEGORY_KEYWORDS: Record<string, ShoppingCategory> = {
  marchew: 'VEGETABLES',
  pietruszka: 'VEGETABLES',
  seler: 'VEGETABLES',
  por: 'VEGETABLES',
  burak: 'VEGETABLES',
  kalarepa: 'VEGETABLES',
  rzepa: 'VEGETABLES',
  brukselka: 'VEGETABLES',
  sałat: 'VEGETABLES',
  kapust: 'VEGETABLES',
  szczypior: 'VEGETABLES',
  czosnek: 'VEGETABLES',
  cebul: 'VEGETABLES',

  śliwk: 'FRUITS',
  porzeczk: 'FRUITS',
  agrest: 'FRUITS',
  morel: 'FRUITS',
  nektaryn: 'FRUITS',

  śmietan: 'DAIRY',
  kefir: 'DAIRY',
  maślank: 'DAIRY',
  jogurt: 'DAIRY',
  ser: 'DAIRY',

  szynk: 'MEAT',
  parówk: 'MEAT',
  kabanos: 'MEAT',
  mielon: 'MEAT',
  wołow: 'MEAT',
  wieprz: 'MEAT',
  cielęc: 'MEAT',
  drób: 'MEAT',
};

const CATEGORY_FALLBACKS: Record<ShoppingCategory, string> = {
  VEGETABLES: '🥬',
  FRUITS: '🍎',
  BAKERY: '🍞',
  DAIRY: '🥛',
  MEAT: '🥩',
  DRINKS: '🥤',
  SWEETS: '🍫',
  CONDIMENTS: '🧂',
  FROZEN: '❄️',
  OTHER: '🛒',
};

export function getSmartProductDefaults(name: string): ProductDefaults {
  const lowerName = name.toLowerCase().trim();

  for (const [keyword, defaults] of Object.entries(PRODUCT_MAPPING)) {
    if (lowerName.includes(keyword)) {
      return defaults;
    }
  }

  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lowerName.includes(keyword)) {
      return {
        category,
        emoji: CATEGORY_FALLBACKS[category],
      };
    }
  }

  return {
    category: 'OTHER',
    emoji: '🛒',
  };
}
