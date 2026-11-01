import { useEffect, useState } from 'react';

// A small choice (like which ghost or season) remembered in this browser only.
export function useSavedChoice(key, options, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return options.includes(saved) ? saved : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage off: the choice still works for this visit.
    }
  }, [key, value]);

  return [value, setValue];
}
