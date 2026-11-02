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
