// Kit, the bundle ghost: keep one, rotate the rest. Every pick is made by these rules in
// the browser (no AI), only from what the person already pays for, at the prices on
// their statement (or the prices they type). Kit never suggests a new product.
// Savings are per month only: no forecasts, no yearly totals.
import { money } from './format';
import { cancelInfo } from './cancelLinks';

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

export const BUNDLE_GROUPS = [
  { key: 'video', label: 'streaming services', emoji: '📺', ask: 'Which do you watch most?', match: /NETFLIX|\bSTAN\b|BINGE|DISNEY|PRIME\s*VIDEO|AMAZON\s*PRIME|PARAMOUNT|APPLE\s*TV|KAYO|FOXTEL|STREAM/i, rotate: true },
  { key: 'music', label: 'music apps', emoji: '🎵', ask: 'Which do you listen to most?', match: /SPOTIFY|APPLE\s*MUSIC|YOUTUBE|AMAZON\s*MUSIC|TIDAL|DEEZER/i, rotate: false },
  { key: 'ai', label: 'AI tools', emoji: '🤖', ask: 'What do you use AI for?', match: null, rotate: false },
  { key: 'storage', label: 'cloud storage plans', emoji: '☁️', ask: 'Where are most of your files?', match: /ICLOUD|GOOGLE\s*ONE|DROPBOX|ONEDRIVE|MICROSOFT\s*365/i, rotate: false },
  { key: 'food', label: 'food delivery passes', emoji: '🍔', ask: 'Which do you order from most?', match: /UBER\s*ONE|DOORDASH|DASHPASS|MENULOG|DELIVEROO|HELLOFRESH|MARLEY\s*SPOON|YOUFOODZ/i, rotate: true },
  { key: 'gaming', label: 'gaming passes', emoji: '🎮', ask: 'Which do you play most?', match: /XBOX|GAME\s*PASS|PLAYSTATION|PS\s*PLUS|NINTENDO|EA\s*PLAY|DISCORD/i, rotate: true },
];
export const GROUP_BY_KEY = Object.fromEntries(BUNDLE_GROUPS.map((g) => [g.key, g]));

export const aiToolFor = (merchant = '') => AI_TOOLS.find((tool) => tool.match.test(merchant)) || null;
const short = (merchant = '') => aiToolFor(merchant)?.name || cancelInfo(merchant).name || merchant;
export const sumMonthly = (items) => Math.round(items.reduce((s, i) => s + (Number(i.monthly) || 0), 0) * 100) / 100;

// Groups of 2+ subscriptions doing the same job. AI tools also count design tools
// (Canva, Adobe), since "images" or "design" may already be covered there.
export function bundleGroups(subscriptions = []) {
  const subs = subscriptions.filter((s) => Number(s.monthly) > 0).map((s) => ({ ...s, name: short(s.merchant) }));
  const out = [];
  BUNDLE_GROUPS.forEach((group) => {
    const items = group.key === 'ai' ? subs.filter((s) => aiToolFor(s.merchant)) : subs.filter((s) => group.match.test(s.merchant) && !aiToolFor(s.merchant));
    const realAi = group.key === 'ai' ? items.filter((s) => !/CANVA|ADOBE/i.test(s.merchant)) : items;
    if (items.length >= 2 && realAi.length >= (group.key === 'ai' ? 1 : 2)) {
      out.push({ ...group, items: [...items].sort((a, b) => b.monthly - a.monthly), monthly: sumMonthly(items) });
    }
  });
  return out;
}

// Typed list, e.g. "ChatGPT $30, Claude $30, Midjourney $15". Weekly amounts become monthly.
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
