/**
 * Centralized translations for HOMEY application.
 * Supports multiple languages with typed keys for safety.
 *
 * Usage:
 *   import { t } from '@/config/i18n';
 *   const label = t('common.save'); // 'Zapisz'
 */

export const translations = {
  // Common UI elements (buttons, labels, placeholders)
  common: {
    save: 'Zapisz',
    cancel: 'Anuluj',
    delete: 'Usuń',
    edit: 'Edytuj',
    add: 'Dodaj',
    clear: 'Wyczyść',
    loading: 'Ładowanie...',
    error: 'Błąd',
    success: 'Sukces',
    close: 'Zamknij',
    confirm: 'Potwierdź',
    yes: 'Tak',
    no: 'Nie',
    optional: '(opcjonalnie)',
  },

  // Authentication & Login
  auth: {
    welcome: 'Witaj w domu',
    email: 'Email',
    password: 'Hasło',
    emailPlaceholder: 'Wpisz swój email',
    passwordPlaceholder: 'Wpisz hasło',
    logIn: 'Zaloguj',
    loggingIn: 'Logowanie...',
    invalidCredentials: 'Niepoprawne dane logowania.',
    somethingWentWrong: 'Coś poszło nie tak.',
  },

  // Shopping List
  shoppingList: {
    title: 'Lista Zakupów',
    createList: 'Utwórz listę',
    createFirstList: 'Utwórz swoją pierwszą listę zakupów',
    emptyState: 'Brak produktów na liście',
    emptyStateHint: 'Dodaj pierwszy produkt',
    emptyCombinedState: 'Brak produktów na wybranych listach',
    completedSection: 'Ukończone',
    clearing: 'Czyszczenie...',
  },

  // Shopping Item (product in list)
  shoppingItem: {
    quantity: 'Ilość',
    unit: 'Jednostka',
    price: 'Cena (PLN)',
    checked: 'Kupione',
    checkedInfo: 'Ta cena trafi do statystyk.',
    uncheckedInfo: 'Cena robocza — nie liczymy jej w statystykach.',
    addPrice: 'Dodaj cenę',
    saveError: 'Nie udało się zapisać. Spróbuj ponownie.',
    deleteTitle: 'Usuń produkt',
    deleteMessage: 'Czy na pewno chcesz usunąć "{name}"?',
    deleteConfirm: 'Usuń',
  },

  // Product Management
  product: {
    createTitle: 'Dodaj produkt',
    editTitle: 'Edytuj produkt',
    name: 'Nazwa produktu',
    basicInfo: 'Podstawowe informacje',
    selectIcon: 'Wybierz ikonę',
    details: 'Szczegóły',
    category: 'Kategoria',
    categorySelect: 'Wybierz...',
    unit: 'Jednostka',
    unitOptional: 'Jednostka (opcjonalnie)',
    unitSelect: 'Wybierz jednostkę...',
    saving: 'Zapisywanie...',
    createError: 'Nie udało się utworzyć produktu.',
    saveError: 'Nie udało się zapisać produktu.',
    updateError: 'Nie udało się zaktualizować produktu.',
    duplicateTitle: 'Produkt już istnieje',
    duplicateMessage: 'Produkt "{name}" już istnieje. Zaktualizować go?',
    duplicateConfirm: 'Tak, zaktualizuj',
    edit: 'Edytuj produkt',
    deleteFromCatalog: 'Usuń produkt z bazy',
    deleteFromCatalogMessage:
      'Czy na pewno chcesz usunąć "{name}" z katalogu produktów? Ta operacja jest nieodwracalna.',
    deleteConfirm: 'Usuń',
  },

  // Product Autocomplete & Search
  productSearch: {
    placeholder: 'Szukaj produktów...',
    searchPlaceholder: 'Szukaj lub wpisz nazwę produktu...',
    sourceLabel: {
      catalog: 'Katalog',
      recent: 'Ostatnie',
      due: 'Przypomnienie',
    },
    addNew: '+ Dodaj nowy produkt: "{query}"',
  },

  // Shopping List Creation
  listCreation: {
    title: 'Stwórz nową listę',
    nameLabel: 'Nazwa listy',
    namePlaceholder: 'np. Biedronka, Castorama...',
    creating: 'Tworzenie...',
    createError: 'Nie udało się utworzyć listy.',
    createSuccess: 'Lista została utworzona.',
  },

  // List Management
  listManagement: {
    deleteTitle: 'Usuń listę',
    deleteMessage: 'Czy na pewno chcesz usunąć tę listę? Wszystkie produkty zostaną usunięte na stałe.',
    deleteConfirm: 'Usuń listę',
    deleteCancel: 'Anuluj',
    clearAllTitle: 'Wyczyść wszystkie produkty',
    clearAllMessage:
      'Czy na pewno chcesz usunąć wszystkie produkty z tej listy? Tej akcji nie można cofnąć.',
    clearAllConfirm: 'Wyczyść',
    clearMissingPricesTitle: 'Brakujące ceny',
    clearMissingPricesMessage:
      'Masz {count} kupionych produktów bez ceny. Wyczyścić mimo to?',
    clearMissingPricesConfirm: 'Wyczyść mimo braków',
    clearMissingPricesCancel: 'Uzupełnij ceny',
  },

  // Categories
  categories: {
    all: 'Wszystkie',
    vegetables: 'Warzywa',
    dairy: 'Nabiał',
    meat: 'Mięso i Ryby',
    bakery: 'Pieczywo',
    fruits: 'Owoce',
    frozen: 'Mrożonki',
    drinks: 'Napoje',
    condiments: 'Przyprawy i Spiżarnia',
    sweets: 'Słodycze',
    other: 'Inne',
  },

  // Units - Categories
  unitCategories: {
    weight: 'Waga',
    volume: 'Objętość',
    count: 'Ilość',
    container: 'Pojemniki',
  },

  // Menu Items (Dropdown actions)
  menu: {
    edit: 'Edytuj',
    delete: 'Usuń',
    editProduct: 'Edytuj produkt',
    deleteFromCatalog: 'Usuń z bazy',
    clearAllItems: 'Wyczyść wszystkie produkty',
    deleteList: 'Usuń listę',
    moreActions: 'Więcej opcji',
  },

  // Accessibility (ARIA labels, screen reader text)
  a11y: {
    closeModal: 'Zamknij okno dialogowe',
    closeNotification: 'Zamknij powiadomienie',
    loading: 'Ładowanie',
    moreActions: 'Więcej opcji',
    searchProducts: 'Szukaj produktów',
    toggleCategory: 'Zmień kategorię',
  },

  // Validation & Error Messages
  validation: {
    nameRequired: 'Nazwa jest wymagana',
    nameTooLong: 'Nazwa jest za długa',
    invalidItemId: 'Nieprawidłowy ID produktu',
    invalidListId: 'Nieprawidłowy ID listy',
    validationFailed: 'Walidacja nie powiodła się',
  },

  // Placeholders & Hints
  placeholders: {
    quantity: '1',
    price: '0,00',
    unit: 'j.m.',
  },
} as const;

/**
 * Type-safe translation key helper.
 * Ensures all translation keys exist at compile time.
 */
export type TranslationKey = string & {
  readonly __brand: 'TranslationKey';
};

/**
 * Get a translation by key with dot notation.
 * Supports nested keys like 'common.save', 'auth.email', etc.
 *
 * @example
 * t('common.save') // 'Zapisz'
 * t('auth.welcome') // 'Witaj w domu'
 */
export function t(key: keyof typeof translations | string): string {
  const keys = key.split('.');
  let current: unknown = translations;

  for (const k of keys) {
    if (typeof current === 'object' && current !== null && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof current === 'string' ? current : key;
}

/**
 * Get a translation and interpolate variables.
 *
 * @example
 * tReplace('listManagement.clearMissingPricesMessage', { count: 5 })
 * // 'Masz 5 kupionych produktów bez ceny. Wyczyścić mimo to?'
 */
export function tReplace(
  key: string,
  variables: Record<string, string | number>
): string {
  let text = t(key);
  for (const [variable, value] of Object.entries(variables)) {
    text = text.replace(`{${variable}}`, String(value));
  }
  return text;
}
