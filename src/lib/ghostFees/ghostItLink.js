// Reads what the Ghost It agent (ASI:One) passes in the URL:
//   ?ref=asi1&subs=netflix,stan,disney&prices=netflix:18.99,stan:16.00,disney:16.00
// Prices are AUD per month. Nothing here is stored or sent anywhere.
// General information about subscriptions only, never financial advice.

export const GROUPS = [
  { key: 'video', label: 'Video streaming' },
  { key: 'music', label: 'Music' },
  { key: 'storage', label: 'Cloud storage' },
  { key: 'ai', label: 'AI tools' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'food', label: 'Food delivery' },
  { key: 'other', label: 'Other' },
];

// key -> [display name, group]
const CATALOGUE = {
  netflix: ['Netflix', 'video'],
  stan: ['Stan', 'video'],
  binge: ['BINGE', 'video'],
  disney: ['Disney+', 'video'],
  disneyplus: ['Disney+', 'video'],
  prime: ['Prime Video', 'video'],
  primevideo: ['Prime Video', 'video'],
  amazonprime: ['Amazon Prime', 'video'],
  paramount: ['Paramount+', 'video'],
  paramountplus: ['Paramount+', 'video'],
  appletv: ['Apple TV+', 'video'],
  kayo: ['Kayo', 'video'],
  foxtel: ['Foxtel', 'video'],
  youtube: ['YouTube Premium', 'music'],
  youtubepremium: ['YouTube Premium', 'music'],
  spotify: ['Spotify', 'music'],
  applemusic: ['Apple Music', 'music'],
  amazonmusic: ['Amazon Music', 'music'],
  icloud: ['iCloud+', 'storage'],
  googleone: ['Google One', 'storage'],
  dropbox: ['Dropbox', 'storage'],
  onedrive: ['OneDrive', 'storage'],
  microsoft365: ['Microsoft 365', 'storage'],
  chatgpt: ['ChatGPT', 'ai'],
  claude: ['Claude', 'ai'],
  gemini: ['Gemini', 'ai'],
  copilot: ['Copilot', 'ai'],
  perplexity: ['Perplexity', 'ai'],
  gamepass: ['Xbox Game Pass', 'gaming'],
  xbox: ['Xbox Game Pass', 'gaming'],
  psplus: ['PlayStation Plus', 'gaming'],
  playstation: ['PlayStation Plus', 'gaming'],
  nintendo: ['Nintendo Switch Online', 'gaming'],
  discord: ['Discord Nitro', 'gaming'],
  nitro: ['Discord Nitro', 'gaming'],
  uberone: ['Uber One', 'food'],
  ubereats: ['Uber One', 'food'],
  doordash: ['DashPass', 'food'],
  dashpass: ['DashPass', 'food'],
  menulog: ['Menulog', 'food'],
  deliveroo: ['Deliveroo', 'food'],
  hellofresh: ['HelloFresh', 'food'],
  marleyspoon: ['Marley Spoon', 'food'],
};

const MAX_SUBS = 15;
const MAX_PRICE = 500;

function cleanKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9+]/g, '').replace(/\+/g, 'plus').slice(0, 30);
}

function titleCase(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function readGhostItParams(search) {
  const params = new URLSearchParams(search || '');
  const ref = cleanKey(params.get('ref')).slice(0, 20) || null;
  const rawSubs = params.get('subs');
  if (!rawSubs) return { ref, subs: [] };

  const prices = {};
  String(params.get('prices') || '').split(',').forEach((pair) => {
    const [name, value] = pair.split(':');
    const price = Number.parseFloat(value);
    if (name && Number.isFinite(price) && price > 0 && price <= MAX_PRICE) prices[cleanKey(name)] = Math.round(price * 100) / 100;
  });

  const seen = new Set();
  const subs = rawSubs.split(',').map(cleanKey).filter((key) => key && !seen.has(key) && seen.add(key)).slice(0, MAX_SUBS)
    .map((key) => {
      const [name, group] = CATALOGUE[key] || [titleCase(key), 'other'];
      return { key, name, group, monthly: prices[key] ?? null };
    });

  return { ref, subs };
}

export function groupSubs(subs) {
  return GROUPS.map((group) => {
    const items = subs.filter((item) => item.group === group.key);
    const priced = items.filter((item) => item.monthly != null);
    const monthly = priced.reduce((sum, item) => sum + item.monthly, 0);
    // Keep the cheapest one; the saving is what the others cost.
    const sorted = [...priced].sort((a, b) => a.monthly - b.monthly);
    const keep = sorted[0] || null;
    const saving = sorted.slice(1).reduce((sum, item) => sum + item.monthly, 0) * 12;
    return { ...group, items, monthly, yearly: monthly * 12, overlap: items.length >= 2, keep, saving };
  }).filter((group) => group.items.length);
}

// One video service per month for 6 months, starting next month.
export function rotationPlan(subs, now = new Date()) {
  const video = subs.filter((item) => item.group === 'video' && item.monthly != null);
  if (video.length < 2) return null;
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + 1 + index, 1);
    const service = video[index % video.length];
    return { label: date.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }), service };
  });
  const rotationCost = months.reduce((sum, month) => sum + month.service.monthly, 0);
  const allCost = video.reduce((sum, item) => sum + item.monthly, 0) * 6;
  return { months, rotationCost, allCost, saved: allCost - rotationCost };
}
