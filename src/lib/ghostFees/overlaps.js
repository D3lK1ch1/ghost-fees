// Double-ups: two or more subscriptions doing the same job.
// General information about subscriptions only, never financial advice.
const GROUPS = [
  { key: 'video', label: 'video streaming services', match: /NETFLIX|\bSTAN\b|BINGE|DISNEY|PRIME\s*VIDEO|AMAZON\s*PRIME|PARAMOUNT|APPLE\s*TV|KAYO|FOXTEL|STREAM/i },
  { key: 'music', label: 'music apps', match: /SPOTIFY|APPLE\s*MUSIC|YOUTUBE|AMAZON\s*MUSIC|TIDAL|DEEZER/i },
  { key: 'storage', label: 'cloud storage plans', match: /ICLOUD|GOOGLE\s*ONE|DROPBOX|ONEDRIVE|MICROSOFT\s*365/i },
  { key: 'ai', label: 'AI assistants', match: /OPENAI|CHATGPT|CLAUDE|ANTHROPIC|GEMINI|COPILOT|PERPLEXITY/i },
  { key: 'design', label: 'design tools', match: /ADOBE|CANVA/i },
  { key: 'fitness', label: 'gym or fitness memberships', match: /GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|F45|PILATES|YOGA/i },
];

export const OVERLAP_TIPS = 'People in this spot often keep one, rotate one per month, or move to a shared family plan.';

export function findOverlaps(subscriptions = []) {
  return GROUPS
    .map((group) => {
      const items = subscriptions.filter((item) => group.match.test(item.merchant));
      const yearly = items.reduce((sum, item) => sum + (Number(item.monthly) || 0) * 12, 0);
      return { ...group, items, yearly };
    })
    .filter((group) => group.items.length >= 2);
}

// Short type names for filter and sort on the Subscriptions tab.
export const TYPE_LABELS = { video: 'Streaming', music: 'Music', storage: 'Cloud', ai: 'AI', design: 'Design', fitness: 'Fitness', other: 'Other' };

export function typeOf(merchant = '') {
  return GROUPS.find((group) => group.match.test(merchant))?.key || 'other';
}

// Life-stage tips for double-ups. General, never "you should".
export const LIFE_STAGES = [
  { key: 'solo', label: 'Just me', tip: OVERLAP_TIPS },
  { key: 'student', label: 'Student', tip: "Some services have student plans for about half price (Spotify Student is $7.99 a month, Selectra, Jun 2026). Worth checking before you keep two." },
  { key: 'couple', label: 'Couple', tip: 'Couples often keep one account between them, or move to a duo or family plan, instead of paying twice.' },
  { key: 'sharehouse', label: 'Sharehouse', tip: 'In a sharehouse, someone else may already pay for the same service. One shared plan split between you is common.' },
  { key: 'family', label: 'Family', tip: 'Family plans usually cover several people on one bill, so separate accounts for each person are a common double-up.' },
];
