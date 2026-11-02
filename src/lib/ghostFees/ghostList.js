// Ghost List: subscriptions the user has asked to cancel.
// Kept in this browser only (localStorage). Only merchant name, monthly price,
// status, date and the proof the person gave (how and when they cancelled, a
// reference, and optionally a shrunk screenshot) are kept, never statement rows.
// Cleared by "Clear my data".
const KEY = 'ghostFees.ghostList.v1';
export const CHANGED = 'ghostfees:ghostlist';

export const STATUSES = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  charging: 'Still charging',
};

export function loadGhostList() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Returns false when the browser wouldn't keep it (private mode, or storage full
// because of screenshots), so the caller can say so.
export function saveGhostList(items) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    // Let every screen showing the list (Subscriptions tab, 💔 story) catch up.
    window.dispatchEvent(new Event(CHANGED));
    return true;
  } catch {
    // Storage can be off (private mode). The list still works for this visit.
    return false;
  }
}

// Mark a subscription cancelled ("requested") with its proof, adding it if new.
export function withCancelled(items, subscription, proof) {
  const patch = { status: 'requested', ...(proof ? { proof } : {}) };
  return items.some((entry) => entry.id === subscription.id)
    ? items.map((entry) => (entry.id === subscription.id ? { ...entry, ...patch } : entry))
    : [...items, { id: subscription.id, merchant: subscription.merchant, monthly: subscription.monthly, date: new Date().toISOString(), ...patch }];
}

export function clearGhostList() {
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    // Nothing to clear.
  }
}

export function daysSince(isoDate) {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.floor((Date.now() - then) / 86400000);
}

export function ghostTotals(items) {
  const yearly = (item) => (Number(item.monthly) || 0) * 12;
  return {
    ghosted: items.filter((item) => item.status !== 'charging').reduce((sum, item) => sum + yearly(item), 0),
    confirmed: items.filter((item) => item.status === 'confirmed').reduce((sum, item) => sum + yearly(item), 0),
  };
}

// Saved so far: each ghosted item's own monthly price, per day since it was ghosted.
export function savedSoFar(items) {
  return items
    .filter((item) => item.status !== 'charging')
    .reduce((sum, item) => sum + ((Number(item.monthly) || 0) * 12 / 365) * daysSince(item.date), 0);
}

