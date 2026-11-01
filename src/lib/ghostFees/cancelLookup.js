import { base44 } from '@/api/base44Client';

// Asks Cass (backend function findCancelInfo) how to cancel one merchant. Only the
// merchant name is sent. Answers are kept for this browser tab so asking twice is
// instant and free.
const KEY = 'ghostFees.cass.v1';

function cache() {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function cachedLookup(merchant) {
  return cache()[String(merchant).toUpperCase()] || null;
}

export async function findCancelInfo(merchant) {
  const hit = cachedLookup(merchant);
  if (hit) return hit;
  const response = await base44.functions.invoke('findCancelInfo', { merchant });
  const data = response?.data;
  if (!data || data.error) throw new Error(data?.error || 'Cass went quiet.');
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ ...cache(), [String(merchant).toUpperCase()]: data }));
  } catch {
    // Storage off: still works, just not cached.
  }
  return data;
}
