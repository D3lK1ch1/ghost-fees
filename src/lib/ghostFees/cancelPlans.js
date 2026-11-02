// "When will you do it?": the time someone picked to cancel each subscription.
// Browser only (localStorage). Keeps the id, name, monthly price and the time, so a
// calendar link (/?done=<id>) can reopen it even in a fresh tab. Cleared with the
// Ghost List by Clear my data.
const KEY = 'ghostFees.cancelPlans.v1';

export function loadPlans() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function savePlan({ id, merchant, monthly }, at) {
  const plans = loadPlans();
  plans[id] = { id, merchant, monthly, at: at.toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(plans));
  } catch {
    // Storage off: the calendar event still has everything it needs.
  }
  return plans[id];
}

export const planFor = (id) => loadPlans()[id] || null;

export function clearPlans() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

export const doneLink = (id) => `${window.location.origin}/?done=${encodeURIComponent(id)}`;

// The three quick choices. Tonight 8 pm (tomorrow if it's already past 8),
// This weekend Saturday 10 am (next Saturday if this one has passed).
export function quickTimes(now = new Date()) {
  const tonight = new Date(now);
  tonight.setHours(20, 0, 0, 0);
  const tonightLabel = tonight <= now ? 'Tomorrow 8 pm' : 'Tonight 8 pm';
  if (tonight <= now) tonight.setDate(tonight.getDate() + 1);
  const saturday = new Date(now);
  saturday.setHours(10, 0, 0, 0);
  saturday.setDate(saturday.getDate() + ((6 - saturday.getDay() + 7) % 7));
  if (saturday <= now) saturday.setDate(saturday.getDate() + 7);
  return [
    { key: 'tonight', label: tonightLabel, at: tonight },
    { key: 'weekend', label: 'This weekend (Sat 10 am)', at: saturday },
  ];
}
