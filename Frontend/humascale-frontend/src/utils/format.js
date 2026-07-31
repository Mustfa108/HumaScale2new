/**
 * Tiny date formatting helpers.
 * We intentionally avoid pulling in `date-fns` locale data per call.
 */

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

export function formatDate(value, opts = {}) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';

  const { withTime = true, ar = true } = opts;

  const datePart = d.toLocaleDateString('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString('ar-EG-u-nu-latn', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let out = datePart;
  if (withTime) out = `${datePart} • ${timePart}`;
  return ar ? toArabicDigits(out) : out;
}

export function formatScore(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return toArabicDigits(Number(value).toFixed(decimals)) + '٪';
}

export function pluralizeAr(count, forms) {
  // forms = [singular, dual (2), plural (3-10), many (11+)]
  if (count === 0) return forms[0];
  if (count === 1) return forms[0];
  if (count === 2) return forms[1] || forms[0];
  if (count >= 3 && count <= 10) return forms[2] || forms[0];
  return forms[3] || forms[0];
}
