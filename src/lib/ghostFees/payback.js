import { money, monthsLabel } from './format';

// "This scan found $X in N months. Ghost Fees is $10 once. That's paid back 29 times."
// Uses the person's own total from their statement, never an average or a projection.
export function paybackLine(results, priceCents, usedSample = false) {
  const total = Number(results?.total) || 0;
  const price = (Number(priceCents) || 1000) / 100;
  if (!results || usedSample || total <= 0) return null;
  const times = Math.floor(total / price);
  const months = monthsLabel(results.monthSpan);
  return {
    found: `This scan found ${money(total)} in ${months} ${Number(months) === 1 ? 'month' : 'months'}.`,
    price: `Ghost Fees is ${money(price).replace('.00', '')} once.`,
    times: times >= 2 ? `That's paid back ${times} times.` : null,
  };
}
