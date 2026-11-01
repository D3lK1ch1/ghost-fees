// Typical Australian prices for the no-upload "Do you have any of these?" list.
// Cheapest to dearest standard monthly plan for new sign-ups, AUD, checked 2 Nov 2026.
// These are TYPICAL prices, never added to anyone's real total. Re-check monthly.
// Left out because no current, sourced AU price could be confirmed: YouTube Premium,
// Apple Music, Google One, ChatGPT Plus.
export const CHECKED_ON = '2 Nov 2026';

export const COMMON_SUBS = [
  { key: 'netflix', name: 'Netflix', group: 'video', low: 9.99, high: 28.99, source: "Tom's Guide, Oct 2026", url: 'https://www.tomsguide.com/reference/netflix-price-australia' },
  { key: 'stan', name: 'Stan', group: 'video', low: 9.99, high: 23.99, source: 'WhistleOut, Jul 2026', url: 'https://www.whistleout.com.au/PayTV/News/stan-price-rise-2026' },
  { key: 'disney', name: 'Disney+', group: 'video', low: 9.99, high: 24.99, source: "Tom's Guide, Apr 2026", url: 'https://www.tomsguide.com/entertainment/disney-plus/disney-raises-prices-again-as-ad-supported-plan-launches-in-australia' },
  { key: 'binge', name: 'BINGE', group: 'video', low: 10, high: 22, source: "Tom's Guide, Oct 2026", url: 'https://www.tomsguide.com/reference/binge-prices-australia' },
  { key: 'kayo', name: 'Kayo', group: 'video', low: 29.99, high: 45.99, source: 'EFTM, Jan 2026', url: 'https://eftm.com/2026/01/kayo-premium-jumps-to-45-99-per-month-while-kayo-standard-drops-in-price-by-1c-270507' },
  { key: 'paramount', name: 'Paramount+', group: 'video', low: 7.99, high: 17.99, source: 'CompareTV, Oct 2026', url: 'https://www.comparetv.com.au/streaming-tv-guide/paramount-plus/price/' },
  { key: 'prime', name: 'Amazon Prime', group: 'video', low: 12.99, high: 12.99, source: 'Finder, Oct 2026', url: 'https://www.finder.com.au/news/amazon-prime-just-got-more-expensive-australia-2026' },
  { key: 'appletv', name: 'Apple TV', group: 'video', low: 15.99, high: 15.99, source: "Tom's Guide, Oct 2026", url: 'https://www.tomsguide.com/reference/apple-tv-plus-price-australia' },
  { key: 'spotify', name: 'Spotify Premium', group: 'music', low: 15.99, high: 27.99, note: 'Student $7.99', source: 'Selectra, Jun 2026', url: 'https://selectra.com.au/streaming/providers/spotify' },
  { key: 'icloud', name: 'iCloud+', group: 'storage', low: 1.49, high: 89.99, source: 'Apple', url: 'https://support.apple.com/en-au/108047' },
  { key: 'microsoft365', name: 'Microsoft 365', group: 'storage', low: 16, high: 33, source: 'Microsoft', url: 'https://www.microsoft.com/EN-AU/microsoft-365/buy/compare-all-microsoft-365-products' },
  { key: 'gamepass', name: 'Xbox Game Pass', group: 'gaming', low: 12.95, high: 25.95, source: 'Press Start, Apr 2026', url: 'https://press-start.com.au/news/xbox/2026/04/22/xbox-game-pass-ultimate-just-got-a-massive-price-drop-and-heres-the-new-aussie-pricing/' },
  { key: 'uberone', name: 'Uber One', group: 'food', low: 9.99, high: 9.99, source: 'Uber', url: 'https://uber.com/au/en/uber-one' },
  { key: 'gym', name: 'Gym membership', group: 'fitness', low: 10, high: 40, unit: 'week', note: 'Chains like Plus Fitness and Jetts at the low end', source: 'FindPrices, Aug 2026 (example ranges)', url: 'https://findprices.com/au/compare/gym-membership-price-comparison' },
];

export const GROUP_LABELS = {
  video: 'Streaming', music: 'Music', storage: 'Cloud and software', gaming: 'Gaming', food: 'Food delivery', fitness: 'Fitness',
};

// Monthly range for one item. Weekly prices become monthly at 52 weeks / 12 months.
export function monthlyRange(item) {
  const factor = item.unit === 'week' ? 52 / 12 : 1;
  return { low: item.low * factor, high: item.high * factor };
}
