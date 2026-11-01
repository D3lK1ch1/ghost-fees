import { useCallback, useEffect, useState } from 'react';
import { CHANGED, loadGhostList, saveGhostList } from '@/lib/ghostFees/ghostList';

// The Ghost List shared by every screen that shows it. Changes made on one screen
// (for example blocking an ex in the 💔 story) show up on the others straight away.
export function useGhostList() {
  const [items, setItems] = useState(loadGhostList);

  useEffect(() => {
    const reload = () => setItems(loadGhostList());
    window.addEventListener(CHANGED, reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(CHANGED, reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const update = useCallback((change) => {
    const next = typeof change === 'function' ? change(loadGhostList()) : change;
    saveGhostList(next);
    setItems(next);
  }, []);

  return [items, update];
}
