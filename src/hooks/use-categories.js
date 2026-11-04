import { useCallback, useEffect, useState } from 'react';
import { typeOf } from '@/lib/ghostFees/overlaps';

// Your own category for a subscription ("this is Food, not Other"), kept in this
// browser by merchant name and shared between components (4 Nov).
const KEY = 'ghostFees.categories.v1';
const EVENT = 'ghostFees:categories';

function read() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function useCategories() {
  const [picked, setPicked] = useState(read);
  useEffect(() => {
    const sync = () => setPicked(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const categoryOf = useCallback((merchant = '') => picked[merchant] || typeOf(merchant), [picked]);
  const setCategory = useCallback((merchant, key) => {
    const next = { ...read() };
    if (!key || key === typeOf(merchant)) delete next[merchant];
    else next[merchant] = key;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage off: it still changes for this visit.
    }
    setPicked(next);
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);
  return { categoryOf, setCategory };
}
