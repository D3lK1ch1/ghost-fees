// Every number shown to people keeps its source and year next to it.
// Checked 2 Nov 2026. Re-check before quoting anywhere new.
// - Compare the Market, "Wasted subscriptions 2026" (Pureprofile, 1,015 Australians, Mar 2026, published 9 Jun 2026).
//   Headline is "up to $1,667" (the article's own table adds to $1,739 because of a Disney+ error).
// - ING Australia media release, 30 Jan 2023 (YouGov, 1,075 adults, Dec 2022).
// - Westpac, Aug 2025.
export const STATS = [
  { key: 'half', emoji: '👻', stat: 'About half', text: "of Australians pay for subscriptions they don't use", source: 'Compare the Market, 2026', url: 'https://www.comparethemarket.com.au/news/wasted-subscriptions-2026' },
  { key: 'waste', emoji: '💸', stat: 'Up to $1,667 a year', text: "wasted on subscriptions people don't use", source: 'Compare the Market, 2026', url: 'https://www.comparethemarket.com.au/news/wasted-subscriptions-2026' },
  { key: 'gym', emoji: '🏋️', stat: '$1,116 a year', text: 'the average unused gym membership', source: 'Compare the Market, 2026', url: 'https://www.comparethemarket.com.au/news/wasted-subscriptions-2026' },
  { key: 'cancel', emoji: '⏳', stat: '9 months', text: 'on average to cancel a payment for something unused', source: 'ING, 2023', url: 'https://newsroom.ing.com.au/unused-subscriptions-and-forgotten-outgoings-could-cost-each-aussie-up-to-1261-a-year/' },
  { key: 'realise', emoji: '🧾', stat: 'Almost 20% more', text: 'spent on subscriptions than people realise', source: 'Westpac, 2025' },
];

export const statFor = (key) => STATS.find((item) => item.key === key);
// Shown on the home strip and the paywall.
export const HEADLINE_STATS = ['half', 'waste', 'cancel'].map(statFor);
