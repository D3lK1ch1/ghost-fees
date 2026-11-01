import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_THEME, THEMES } from '@/lib/ghostFees/themes';

const KEY = 'ghostFees.theme';
const ThemeContext = createContext({ theme: THEMES[DEFAULT_THEME], setThemeKey: () => {} });

function readSaved() {
  try {
    const saved = window.localStorage.getItem(KEY);
    return THEMES[saved] ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(readSaved);
  const theme = THEMES[themeKey] || THEMES[DEFAULT_THEME];

  useEffect(() => {
    const root = document.documentElement;
    const allVars = new Set(Object.values(THEMES).flatMap((item) => Object.keys(item.vars || {})));
    allVars.forEach((name) => root.style.removeProperty(name));
    Object.entries(theme.vars || {}).forEach(([name, value]) => root.style.setProperty(name, value));
    root.dataset.theme = theme.key;
    try {
      window.localStorage.setItem(KEY, theme.key);
    } catch {
      // Storage off: the theme still applies for this visit.
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setThemeKey }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
