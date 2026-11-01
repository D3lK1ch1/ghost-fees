// Levels and badges from the Ghost List. Fun only: they never change any numbers.
export const LEVELS = [
  { name: 'Rookie', min: 0 },
  { name: 'Hunter', min: 100 },
  { name: 'Exorcist', min: 500 },
  { name: 'Legend', min: 1000 },
];

export function levelFor(yearlyGhosted) {
  let index = 0;
  LEVELS.forEach((level, i) => { if (yearlyGhosted >= level.min) index = i; });
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const progress = next ? Math.min(1, (yearlyGhosted - current.min) / (next.min - current.min)) : 1;
  return { current, next, progress };
}

// overlapIds: subscription ids that sit in a double-up group.
// priceRiseIds: subscription ids whose price went up in the statement.
export function badgesFor(items, { overlapIds = new Set(), priceRiseIds = new Set() } = {}) {
  const active = items.filter((item) => item.status !== 'charging');
  return [
    { key: 'first', emoji: '👻', name: 'First Ghost', earned: active.length > 0, how: 'Cancel your first subscription' },
    { key: 'overlap', emoji: '🧲', name: 'Overlap Buster', earned: active.some((item) => overlapIds.has(item.id)), how: 'Cancel one of a double-up' },
    { key: 'price', emoji: '📈', name: 'Price Rise Spotter', earned: active.some((item) => priceRiseIds.has(item.id)), how: 'Cancel something that raised its price' },
    { key: 'clear', emoji: '🏚️', name: 'House Cleared', earned: items.length > 0 && items.every((item) => item.status === 'confirmed'), how: 'Confirm every ghost on your list actually stopped charging' },
  ];
}
