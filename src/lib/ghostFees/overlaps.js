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
