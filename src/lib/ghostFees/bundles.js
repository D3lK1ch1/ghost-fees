// Kit, the bundle ghost: keep one, rotate the rest. Every pick is made by these rules in
// the browser (no AI), only from what the person already pays for, at the prices on
// their statement (or the prices they type). Kit never suggests a new product.
// Savings are per month only: no forecasts, no yearly totals.
import { money } from './format';
import { cancelInfo } from './cancelLinks';
import CATALOGUE from './ghostItCatalogue.json';

// What each AI tool mainly does, from its own product pages (Nov 2026). Coarse on purpose:
// "covers" means the tool's main paid plan is known for it. Kit says to check your plan.
export const AI_NEEDS = [
  { key: 'writing', label: 'Writing', emoji: '✍️' },
  { key: 'docs', label: 'Docs & formatting', emoji: '📄' },
  { key: 'images', label: 'Images', emoji: '🖼️' },
  { key: 'video', label: 'Video', emoji: '🎬' },
  { key: 'design', label: 'Design', emoji: '🎨' },
  { key: 'coding', label: 'Coding', emoji: '💻' },
  { key: 'research', label: 'Research', emoji: '🔎' },
];
const NEED_LABEL = Object.fromEntries(AI_NEEDS.map((n) => [n.key, n.label.toLowerCase()]));

export const AI_TOOLS = [
  { name: 'ChatGPT', match: /OPENAI|CHATGPT/i, covers: ['writing', 'docs', 'images', 'coding', 'research'] },
  { name: 'Claude', match: /CLAUDE|ANTHROPIC/i, covers: ['writing', 'docs', 'coding', 'research'] },
  { name: 'Gemini', match: /GEMINI|GOOGLE\s*(AI|ONE\s*AI)/i, covers: ['writing', 'docs', 'images', 'video', 'research'] },
  { name: 'Microsoft Copilot', match: /COPILOT\s*PRO|MICROSOFT\s*COPILOT|M365\s*COPILOT/i, covers: ['writing', 'docs', 'images'] },
  { name: 'GitHub Copilot', match: /GITHUB/i, covers: ['coding'] },
  { name: 'Copilot', match: /COPILOT/i, covers: ['writing', 'docs', 'coding'] },
  { name: 'Perplexity', match: /PERPLEXITY/i, covers: ['research', 'writing'] },
  { name: 'Midjourney', match: /MIDJOURNEY/i, covers: ['images', 'video'] },
  { name: 'Runway', match: /RUNWAY/i, covers: ['video', 'images'] },
  { name: 'Canva', match: /CANVA/i, covers: ['design', 'images', 'video', 'docs'] },
  { name: 'Adobe', match: /ADOBE|FIREFLY/i, covers: ['design', 'images', 'video'] },
  { name: 'Grammarly', match: /GRAMMARLY/i, covers: ['writing', 'docs'] },
  { name: 'Notion', match: /NOTION/i, covers: ['docs', 'writing'] },
  { name: 'Cursor', match: /CURSOR/i, covers: ['coding'] },
  { name: 'Windsurf', match: /WINDSURF|CODEIUM/i, covers: ['coding'] },
  { name: 'Replit', match: /REPLIT/i, covers: ['coding'] },
  { name: 'Lovable', match: /LOVABLE/i, covers: ['coding', 'design'] },
  { name: 'Bolt', match: /\bBOLT\b/i, covers: ['coding'] },
  { name: 'v0', match: /\bV0\b/i, covers: ['coding', 'design'] },
];

// Double-ups are spotted with Ghost It's own catalogue (agent/agent.py, copied in by
// scripts/sync-ghostit-catalogue.py), so the app and the agent agree on every pack.
const ALIASES = CATALOGUE.services
  .flatMap((s) => s.aliases.map((alias) => ({ alias: alias.toLowerCase(), s })))
  .sort((a, b) => b.alias.length - a.alias.length);
const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALIAS_RE = ALIASES.map(({ alias, s }) => ({ re: new RegExp(`(^|[^a-z0-9])${escape(alias)}([^a-z0-9]|$)`), s }));

// Kit's groups: Ghost It's overlap groups, with Kit's question for each.
const KIT_GROUPS = {
  video: { ask: 'Which do you watch most?', rotate: true, fallback: /STREAM/i },
  music: { ask: 'Which do you listen to most?', rotate: false },
  storage: { ask: 'Where are most of your files?', rotate: false },
  design: { ask: 'Which do you design in most?', rotate: false },
  delivery: { ask: 'Which do you order from most?', rotate: true },
  mealkit: { ask: 'Which meal kit do you cook most?', rotate: true },
  gaming: { ask: 'Which do you play most?', rotate: true },
};
export const BUNDLE_GROUPS = [
  ...Object.entries(KIT_GROUPS).map(([key, g]) => {
    const pack = CATALOGUE.services.find((s) => s.overlap === key)?.pack;
    return { key, ...g, label: CATALOGUE.overlapNames[key] || key, pack, emoji: CATALOGUE.packEmoji[pack] || '📦' };
  }),
  { key: 'ai', label: 'AI tools', pack: 'Tech Stack', emoji: '🤖', ask: 'What do you use AI for?', rotate: false },
];
export const GROUP_BY_KEY = Object.fromEntries(BUNDLE_GROUPS.map((g) => [g.key, g]));

// Ghost It's six Ghost Packs, each with what it hunts and the groups Kit sorts inside it.
export const GHOST_PACKS = CATALOGUE.packs.map((pack) => ({
  key: pack,
  name: pack === 'Gym and Fitness' ? 'Gym & Fitness' : pack,
  emoji: CATALOGUE.packEmoji[pack] || '📦',
  hunts: CATALOGUE.packHunts[pack] || '',
  groups: pack === 'Tech Stack' ? ['ai', 'storage', 'design'] : BUNDLE_GROUPS.filter((g) => g.pack === pack && g.key !== 'ai').map((g) => g.key),
}));

// The Ghost It service a merchant is (e.g. "NETFLIX.COM 866..." -> Netflix), or null.
export function serviceFor(merchant = '') {
  // Statements add symbols (UBER *EATS, NETFLIX.COM): treat them as spaces, keep + for Disney+.
  const text = String(merchant).toLowerCase().replace(/[^a-z0-9+.]+/g, ' ');
  return ALIAS_RE.find(({ re }) => re.test(text))?.s || null;
}
export const aiToolFor = (merchant = '') => AI_TOOLS.find((tool) => tool.match.test(merchant)) || null;
const short = (merchant = '') => serviceFor(merchant)?.name || aiToolFor(merchant)?.name || cancelInfo(merchant).name || merchant;
export const sumMonthly = (items) => Math.round(items.reduce((s, i) => s + (Number(i.monthly) || 0), 0) * 100) / 100;

// Ghost It's bundle tips (agent.py bundle_tips), shown under each group. General facts.
export function bundleTips(groupKey, items) {
  const keys = new Set(items.map((i) => serviceFor(i.merchant)?.key).filter(Boolean));
  const tips = [];
  if (groupKey === 'music') {
    if (keys.has('youtube')) tips.push('YouTube Premium already includes YouTube Music, so you may not need another music app.');
    tips.push('Live with someone who also pays? Spotify Duo and Family put 2 to 6 people at one address on one plan.');
    if (['applemusic', 'icloud', 'appletv'].some((k) => keys.has(k))) tips.push('Apple One bundles Apple Music, Apple TV+ and iCloud+ in one bill. Compare it with what you pay now.');
  } else if (groupKey === 'storage') {
    if (keys.has('m365')) tips.push('Microsoft 365 already includes 1 TB of OneDrive storage.');
    tips.push('Most storage plans can be shared with family (Google One with up to 5 others, iCloud+ through Family Sharing).');
  } else if (groupKey === 'video') {
    tips.push('Most streaming apps let you cancel and come back any month, so rotating loses nothing but the wait.');
    if (keys.has('prime')) tips.push("Prime Video comes with Amazon Prime, so if you keep Prime for delivery, that's your free one.");
  } else if (groupKey === 'ai') {
    tips.push('Most people need one general AI chat (ChatGPT, Claude or Gemini) and at most one coding tool.');
  } else if (groupKey === 'delivery') {
    tips.push('Check your bank card and phone plan perks first: some include a delivery membership.');
  } else if (groupKey === 'mealkit') {
    tips.push('One meal kit at a time is plenty. Most let you skip weeks for free instead of cancelling.');
  } else if (groupKey === 'gaming') {
    tips.push('Keep the pass for the console you play most, and rotate the others month to month.');
  }
  return tips;
}

const overlapOf = (s) => {
  const svc = serviceFor(s.merchant);
  if (svc?.overlap) return svc.overlap;
  if (svc) return null;
  return Object.entries(KIT_GROUPS).find(([, g]) => g.fallback?.test(s.merchant))?.[0] || null;
};

// Groups of 2+ subscriptions doing the same job (Ghost It's overlap groups). AI tools
// also count design tools (Canva, Adobe), since "images" or "design" may be covered there.
export function bundleGroups(subscriptions = []) {
  const subs = subscriptions.filter((s) => Number(s.monthly) > 0).map((s) => ({ ...s, name: short(s.merchant) }));
  const out = [];
  BUNDLE_GROUPS.forEach((group) => {
    const items = group.key === 'ai'
      ? subs.filter((s) => aiToolFor(s.merchant) || ['ai', 'design'].includes(overlapOf(s)))
      : subs.filter((s) => overlapOf(s) === group.key);
    const realAi = group.key === 'ai' ? items.filter((s) => overlapOf(s) === 'ai' || (aiToolFor(s.merchant) && overlapOf(s) !== 'design')) : items;
    if (items.length >= 2 && realAi.length >= (group.key === 'ai' ? 1 : 2)) {
      out.push({ ...group, items: [...items].sort((a, b) => b.monthly - a.monthly), monthly: sumMonthly(items), tips: bundleTips(group.key, items) });
    }
  });
  return out;
}

// Merge typed subscriptions into the statement's (a typed one replaces the same service).
export function mergeSubs(statement = [], typed = []) {
  const typedNames = new Set(typed.map((t) => t.name));
  return [...statement.filter((s) => !typedNames.has(short(s.merchant))), ...typed];
}

// Typed list, e.g. "Netflix $19, Stan $16, ChatGPT $30". Weekly amounts become monthly.
export function parseTyped(text = '') {
  const found = [];
  const re = /([A-Za-z][A-Za-z0-9+ .&'-]{1,30}?)\s*(?:[:-]\s*)?\$\s*(\d+(?:\.\d{1,2})?)\s*(a week|per week|\/\s*w(?:ee)?k|weekly)?/gi;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1].replace(/^(and|i pay|i have|plus)\s+/i, '').trim();
    const price = Number(m[2]);
    if (!name || !price) continue;
    found.push({ merchant: name.toUpperCase(), name: short(name), monthly: m[3] ? Math.round(price * 52 / 12 * 100) / 100 : price, typed: true });
  }
  return found;
}


export function keepPlan(group, keepName) {
  const keep = group.items.find((i) => i.name === keepName) || group.items[0];
  const cancel = group.items.filter((i) => i !== keep);
  return { keep, cancel, saving: sumMonthly(cancel), now: group.monthly };
}

// One service at a time, a month each: the favourite first, then the rest by price.
export function rotationPlan(group, keepName, today = new Date()) {
  const first = group.items.find((i) => i.name === keepName) || group.items[0];
  const order = [first, ...group.items.filter((i) => i !== first)];
  const months = order.map((item, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + 1 + i, 1);
    return { item, date: d, label: d.toLocaleDateString('en-AU', { month: 'long' }) };
  });
  const average = Math.round((sumMonthly(order) / order.length) * 100) / 100;
  return { months, average, now: group.monthly, saving: Math.round((group.monthly - average) * 100) / 100 };
}

// Smallest set (max 3) of tools they already pay for that covers the ticked needs,
// cheapest first, within budget if possible. If nothing fits the budget, the best
// coverage that does fit, and what's left uncovered.
export function aiPlan(tools, needs, budget = null) {
  const items = tools.map((t) => ({ ...t, covers: aiToolFor(t.merchant)?.covers || [] }));
  const wanted = needs.length ? needs : ['writing'];
  const canCover = wanted.filter((n) => items.some((t) => t.covers.includes(n)));
  const missing = wanted.filter((n) => !canCover.includes(n));
  const subsets = [];
  const n = Math.min(items.length, 12);
  for (let mask = 1; mask < (1 << n); mask += 1) {
    const pick = items.filter((_, i) => mask & (1 << i));
    if (pick.length > 3) continue;
    const covered = canCover.filter((need) => pick.some((t) => t.covers.includes(need)));
    subsets.push({ pick, covered, cost: sumMonthly(pick) });
  }
  const better = (a, b) => (b.covered.length - a.covered.length) || (a.cost - b.cost) || (a.pick.length - b.pick.length);
  const full = subsets.filter((s) => s.covered.length === canCover.length).sort(better);
  const inBudget = budget ? subsets.filter((s) => s.cost <= budget).sort(better) : [];
  const best = full[0] && (!budget || full[0].cost <= budget) ? full[0] : (inBudget[0] || full[0]);
  if (!best) return null;
  const keep = best.pick;
  const cancel = items.filter((t) => !keep.includes(t));
  const uncovered = [...missing, ...canCover.filter((need) => !best.covered.includes(need))];
  return {
    keep: keep.map((t) => ({ ...t, uses: wanted.filter((need) => t.covers.includes(need)) })),
    cancel, uncovered, missing,
    cost: best.cost, now: sumMonthly(items), saving: Math.round((sumMonthly(items) - best.cost) * 100) / 100,
    overBudget: Boolean(budget && best.cost > budget), budget,
  };
}

export const needList = (keys) => keys.map((k) => NEED_LABEL[k] || k).join(', ').replace(/, ([^,]*)$/, ' and $1');
export const itemLine = (items) => items.map((i) => `${i.name} ${money(i.monthly)}`).join(', ');

// Calendar file: on each switch day, start the next one and cancel the last.
export function rotationIcs(plan, today = new Date()) {
  const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const stamp = `${ymd(today)}T000000Z`;
  const clean = (t) => String(t).replace(/[,;\\\n]/g, ' ');
  const events = plan.months.map(({ item, date }, i) => {
    const prev = plan.months[i - 1]?.item;
    const end = new Date(date); end.setDate(end.getDate() + 1);
    const title = prev ? `Kit: switch from ${prev.name} to ${item.name}` : `Kit: ${item.name} month starts`;
    const details = prev ? `Cancel ${prev.name} today, then start ${item.name}. One at a time.` : `Keep ${item.name} this month. Cancel the others before they renew.`;
    return [
      'BEGIN:VEVENT', `UID:kit-${ymd(date)}-${i}@ghostfees`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(date)}`, `DTEND;VALUE=DATE:${ymd(end)}`,
      `SUMMARY:${clean(title)}`, `DESCRIPTION:${clean(details)}`,
      'BEGIN:VALARM', 'TRIGGER:-P2D', 'ACTION:DISPLAY', `DESCRIPTION:${clean(title)} in 2 days`, 'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ghost Fees//Kit rotation//EN', ...events, 'END:VCALENDAR'].join('\r\n');
}

export function downloadRotation(plan) {
  const blob = new Blob([rotationIcs(plan)], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'kit-rotation.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- Kit's research (6 Nov) ----
// Genres people tap before Kit looks up where their shows are.
export const GENRES = ['Romcom', 'Drama', 'Crime', 'Comedy', 'Reality', 'Sport', 'Kids', 'Docos', 'Sci-fi', 'Anime'];
// Made-up services in the sample statement: never searched, labelled as samples.
export const isSampleService = (name = '') => /STREAMMAX/i.test(name);
export const splitShows = (text = '') => text.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean).slice(0, 5);

// The cost-benefit table and Kit's verdict, from the research (facts) plus the prices on
// the statement. Rules only: shows count double, a genre win counts once.
export function researchVerdict(group, research) {
  const shows = research?.shows || [];
  const genres = research?.genres || [];
  const found = shows.filter((s) => s.service !== 'none');
  const rows = group.items.map((item) => {
    const mine = shows.filter((s) => s.service === item.name);
    const wins = genres.filter((g) => g.service === item.name);
    const score = mine.length * 2 + wins.length;
    return {
      item, shows: mine, genres: wins, score, sample: isSampleService(item.name),
      perShow: mine.length ? Math.round((item.monthly / mine.length) * 100) / 100 : null,
    };
  }).sort((a, b) => b.score - a.score || a.item.monthly - b.item.monthly);
  const top = rows[0];
  const useful = rows.filter((r) => r.score > 0);
  const topShare = found.length ? top.shows.length / found.length : (useful.length === 1 ? 1 : 0);
  const mode = !useful.length ? 'none' : (useful.length === 1 || topShare >= 0.7) ? 'keep' : 'rotate';
  let rotation = null;
  if (mode === 'rotate') {
    const order = useful.map((r) => r.item);
    const plan = rotationPlan({ ...group, items: order, monthly: sumMonthly(order) }, order[0].name);
    rotation = { ...plan, now: group.monthly, saving: Math.round((group.monthly - plan.average) * 100) / 100 };
  }
  const keepItems = mode === 'keep' ? [top.item] : mode === 'rotate' ? useful.map((r) => r.item) : [];
  const cancel = group.items.filter((i) => !keepItems.includes(i));
  const verdictFor = (row) => {
    if (mode === 'keep') return row === top ? 'Keep' : 'Cancel';
    if (mode === 'rotate') {
      const month = rotation.months.find((m) => m.item === row.item);
      return month ? `Rotate: ${month.label}` : 'Cancel';
    }
    return 'Your pick';
  };
  return {
    rows: rows.map((r) => ({ ...r, verdict: verdictFor(r) })),
    mode, top, rotation, cancel,
    missing: shows.filter((s) => s.service === 'none').map((s) => s.title),
    keepSaving: mode === 'keep' ? Math.round((group.monthly - top.item.monthly) * 100) / 100 : 0,
  };
}
