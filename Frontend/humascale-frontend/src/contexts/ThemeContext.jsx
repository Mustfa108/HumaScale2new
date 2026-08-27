import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { THEME_STORAGE_KEY } from '../utils/locale';
import { preferencesApi } from '../api/preferences';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

function readStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

function resolveDark(theme) {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme) {
  const dark = resolveDark(theme);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  useEffect(() => {
    if (user?.theme === 'light' || user?.theme === 'dark' || user?.theme === 'system') {
      setThemeState(user.theme);
    }
  }, [user?.theme]);

  const setTheme = useCallback(
    async (next) => {
      if (!['light', 'dark', 'system'].includes(next)) return;
      setThemeState(next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
      applyTheme(next);
      if (!isAuthenticated) return;
      try {
        await preferencesApi.update({ theme: next });
      } catch {
        /* keep local choice */
      }
    },
    [isAuthenticated],
  );

  const value = useMemo(
    () => ({
      theme,
      isDark: resolveDark(theme),
      setTheme,
    }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
