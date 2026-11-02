// Every number shown to people comes from upgradeStats.json, with its source and
// year next to it. Checked 2 Nov 2026 (FINAL_UPDATE_PACK 1.1). Re-check before
// quoting anywhere new.
import UPGRADE_STATS from './upgradeStats.json';

const EMOJI = { half: '👻', waste: '💸', aussies: '🇦🇺', realise: '🧾', trial: '⏰', gym: '🏋️', cancel: '⏳', traps: '⚖️', netflix: '📺', double: '👯', hard: '🧱' };

// The older shape some screens use: { key, emoji, stat, text, source, url }.
export const STATS = UPGRADE_STATS.map((item) => ({ key: item.id, emoji: EMOJI[item.id] || '👻', stat: item.big, text: item.text, source: item.source, url: item.url, matches: item.matches }));

export { UPGRADE_STATS };
export const statFor = (key) => STATS.find((item) => item.key === key);
// Stats tagged for a place in the app: home, paywall, reveal, trial, gym, cancel, streaming, double.
export const statsFor = (place) => STATS.filter((item) => item.matches.includes(place));
// Shown on the home strip: stats 1 to 3.
export const HEADLINE_STATS = statsFor('home');

// One stat per ghost card, only where it fits (B9). Returns a stat key or null.
const GYM_RE = /\b(GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|F45|SNAP|PILATES|YOGA)\b/i;
export function statKeyForLeak(leak = {}) {
  const name = `${leak.merchant || ''} ${leak.title || ''}`;
  if (GYM_RE.test(name)) return 'gym';
  if (/trial/i.test(leak.badge || '')) return 'trial';
  if (/NETFLIX/i.test(name)) return 'netflix';
  if (/duplicate/i.test(leak.badge || '')) return 'double';
  return null;
}
