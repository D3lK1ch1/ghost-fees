import { money } from './format';

export const BADGE_TONES = {
  Duplicate: 'bg-[#2b2440] text-[#cbb8ff]',
  'Price creep': 'bg-[#3a2a1f] text-[#ffb37c]',
  'Trial converted': 'bg-[#1f2f3a] text-[#9fd8ff]',
  'Bank fee': 'bg-[#2f2a20] text-[#e3cda4]',
};

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Turns the raw analysis into one card per leak, sorted by yearly cost.
export function buildLeaks({ subscriptions = [], fees = [] } = {}) {
  const leaks = [];

  subscriptions.forEach((sub) => {
    const rise = sub.creep;
    const trial = rise && rise.from > 0 && rise.to >= rise.from * 1.4;
    const badge = rise ? (trial ? 'Trial converted' : 'Price creep') : 'Duplicate';

    let meta = `${money(sub.amount)} ${sub.frequencyLabel.toLowerCase()} \u00b7 ${sub.occurrences} charges`;
    if (rise) {
      meta = trial
        ? `started at ${money(rise.from)}, now ${money(rise.to)}`
        : `was ${money(rise.from)}, now ${money(rise.to)}`;
    }

    leaks.push({
      id: sub.id,
      merchant: sub.merchant,
      badge,
      meta,
      yearlyCost: round2(sub.yearlyCost),
      amount: sub.amount,
      frequencyLabel: sub.frequencyLabel,
    });
  });

  fees.forEach((fee) => {
    leaks.push({
      id: fee.id,
      merchant: fee.merchant,
      badge: 'Bank fee',
      meta: `${fee.occurrences} charge${fee.occurrences === 1 ? '' : 's'} \u00b7 ${money(fee.amount)} last`,
      yearlyCost: round2(fee.yearlyCost),
      amount: fee.amount,
      frequencyLabel: fee.frequencyLabel,
    });
  });

  return leaks.sort((a, b) => b.yearlyCost - a.yearlyCost);
}