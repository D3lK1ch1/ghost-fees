import { isHabitKeeper, readHabit } from './habitPlan';
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
    { key: 'first', emoji: '👻', name: 'First Ghost', earned: active.length > 0, how: 'Cancel your first subscription', about: 'Mark any subscription as cancelled on your Ghost List (I cancelled it). That’s your first ghost busted.' },
    { key: 'overlap', emoji: '✂️', name: 'Overlap Buster', earned: active.some((item) => overlapIds.has(item.id)), how: 'Cancel one of a double-up (like 2 streaming apps)', about: 'Ghost Fees spots double-ups: 2 or more services doing the same job, like 3 streaming apps or 2 cloud storage plans. Cancel one of them to earn it.' },
    { key: 'price', emoji: '📈', name: 'Price Rise Spotter', earned: active.some((item) => priceRiseIds.has(item.id)), how: 'Cancel something that raised its price', about: 'Ghost Fees spots price creep: a regular charge that quietly went up in your statement. Cancel one that did to earn it.' },
    { key: 'clear', emoji: '🏚️', name: 'House Cleared', earned: items.length > 0 && items.every((item) => item.status === 'confirmed'), how: 'Confirm every one on your list stopped charging', about: 'After you cancel, check your next statement (or tap Confirmed). When every ghost on your list is confirmed stopped, the house is cleared.' },
    // Pack 10: kept one habit from Hattie's plan for 2 weekly check-ins (this browser only).
    { key: 'habit', emoji: '🏅', name: 'Habit Keeper', earned: isHabitKeeper(readHabit()), how: 'Keep one money habit for 2 weeks', about: "Pick one habit with Hattie in the Money patterns tab. When she checks in a week later, say Yes. Do it twice and you're a Habit Keeper. Saved in this browser only." },
  ];
}
