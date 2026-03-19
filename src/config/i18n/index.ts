/**
 * i18n module - centralized translation management
 *
 * Usage:
 *   import { t, Keys, tReplace } from '@/config/i18n';
 *
 *   // Type-safe key usage (recommended)
 *   <button>{t(Keys.COMMON.SAVE)}</button>
 *
 *   // With interpolation
 *   <p>{tReplace(Keys.SHOPPING_ITEM.DELETE_MESSAGE, { name: 'Chleb' })}</p>
 */

export { t, tReplace, translations, Keys } from './translations';
export { pluralPl } from './pluralPl';
