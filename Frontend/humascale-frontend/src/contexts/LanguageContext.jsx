import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MESSAGES, lookup } from '../i18n/messages';
import { LOCALE_STORAGE_KEY } from '../utils/locale';
import { preferencesApi } from '../api/preferences';
import { useAuth } from './AuthContext';

const LanguageContext = createContext(null);

function readStoredLocale() {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === 'en' || stored === 'ar' ? stored : 'ar';
}

function applyDocumentLocale(locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

export function LanguageProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [locale, setLocaleState] = useState(readStoredLocale);

  useEffect(() => {
    applyDocumentLocale(locale);
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    if (user?.locale === 'ar' || user?.locale === 'en') {
      setLocaleState(user.locale);
    }
  }, [user?.locale]);

  const setLocale = useCallback(
    async (next) => {
      if (next !== 'ar' && next !== 'en') return;
      setLocaleState(next);
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
      applyDocumentLocale(next);
      if (!isAuthenticated) return;
      try {
        await preferencesApi.update({ locale: next });
      } catch {
        /* keep local choice even if API fails */
      }
    },
    [isAuthenticated],
  );

  const t = useCallback(
    (path, vars = {}) => {
      const raw = lookup(MESSAGES[locale] || MESSAGES.ar, path);
      if (typeof raw !== 'string') return path;
      return Object.entries(vars).reduce(
        (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
        raw,
      );
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      isRtl: locale === 'ar',
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
