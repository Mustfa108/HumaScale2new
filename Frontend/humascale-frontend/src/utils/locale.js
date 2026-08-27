/**
 * Pick a bilingual API field by the active locale.
 * Prefers the requested language and falls back to the other.
 *
 * @param {Record<string, unknown>|null|undefined} obj
 * @param {string} base Field base without _ar/_en (e.g. "name", "action", "kpi")
 * @param {'ar'|'en'} locale
 * @returns {string}
 */
export function pickLocale(obj, base, locale = 'ar') {
  if (!obj) return '';
  const ar = obj[`${base}_ar`];
  const en = obj[`${base}_en`];
  if (locale === 'en') return (en || ar || '').toString();
  return (ar || en || '').toString();
}

/**
 * Pillar display name from mixed dashboard / results shapes.
 *
 * @param {Record<string, unknown>|null|undefined} row
 * @param {'ar'|'en'} locale
 */
export function pillarLabel(row, locale = 'ar') {
  if (!row) return '';
  if (locale === 'en') {
    return (
      row.pillar_en ||
      row.pillar_name_en ||
      row.name_en ||
      row.pillar_ar ||
      row.pillar_name_ar ||
      row.name_ar ||
      row.pillar_key ||
      ''
    );
  }
  return (
    row.pillar_ar ||
    row.pillar_name_ar ||
    row.name_ar ||
    row.pillar_en ||
    row.pillar_name_en ||
    row.pillar_key ||
    ''
  );
}

export const LOCALE_STORAGE_KEY = 'humascale_locale';
export const THEME_STORAGE_KEY = 'humascale_theme';
