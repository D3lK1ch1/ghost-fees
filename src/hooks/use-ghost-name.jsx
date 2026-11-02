import { useCallback, useEffect, useState } from 'react';

// Your ghost's name ("Boo" until you change it), kept in this browser only.
// Letters, numbers and spaces, up to 20 characters. Every screen showing it
// (guide picker, Ghost List, share text) updates together.
const KEY = 'ghostFees.ghostName';
const CHANGED = 'ghostfees:ghostname';
export const DEFAULT_GHOST_NAME = 'Boo';

export const cleanGhostName = (value) => String(value || '').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '').slice(0, 20);

const load = () => {
  try {
    return cleanGhostName(window.localStorage.getItem(KEY) || '');
  } catch {
    return '';
  }
};

// Returns [shown name, what's typed, setter]. An empty field shows "Boo".
export function useGhostName() {
  const [typed, setTyped] = useState(load);

  useEffect(() => {
    const reload = () => setTyped(load());
    window.addEventListener(CHANGED, reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(CHANGED, reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const setName = useCallback((value) => {
    const next = cleanGhostName(value);
    setTyped(next);
    try {
      window.localStorage.setItem(KEY, next);
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      // Storage off: the name still works for this visit.
    }
  }, []);

  return [typed.trim() || DEFAULT_GHOST_NAME, typed, setName];
}
