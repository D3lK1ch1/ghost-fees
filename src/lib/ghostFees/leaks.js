export const BADGE_TONES = {
  Duplicate: 'bg-[#fde2e7] text-[#a3173b]',
  'Price creep': 'bg-[#ffe6cc] text-[#a24a00]',
  'Trial converted': 'bg-[#e9e2ff] text-[#5a34c4]',
  'Bank fee': 'bg-[#dbe9ff] text-[#1f4fa8]',
  Overlap: 'bg-[#f3e6ff] text-[#6b2fa8]',
  'Borrowing cost': 'bg-[#fbe0dc] text-[#96331b]',
  Surcharge: 'bg-[#e0eeff] text-[#22557f]',
  'Still using this?': 'bg-[#d8f5e6] text-[#17734a]',
};
// What each kind of ghost means, in plain words and what to do. Shown under the
// filter chips and on each card's badge. "What's trial converted?" (2 Nov)
export const BADGE_MEANING = {
  Duplicate: { what: 'Charged twice for the same thing, on the same day or close together.', todo: 'Ask for the extra charge back.' },
  'Price creep': { what: 'A regular charge that quietly went up.', todo: 'Check it’s still worth it, or ask for the old price.' },
  'Trial converted': { what: 'A free trial that turned into a paid subscription.', todo: 'Cancel it if you don’t use it and ask for a refund of the first charge.' },
  'Bank fee': { what: 'Fees your bank charged, like a monthly account fee or an overdrawn fee.', todo: 'Ask for a waiver, or move to a no-fee account.' },
  Overlap: { what: 'Two or more services doing the same job.', todo: 'Keep one, or rotate them month to month.' },
  'Borrowing cost': { what: 'Interest or fees for borrowing, like a cash advance or late payment.', todo: 'Pay it off first and ask about a hardship plan if needed.' },
  Surcharge: { what: 'An extra fee for paying a certain way, like a card surcharge.', todo: 'Pay another way next time, like bank transfer.' },
  'Still using this?': { what: 'A regular charge you might have forgotten.', todo: 'Cancel it if you don’t use it.' },
};

// Behavioural-finance layer (5 Nov, written new for Ghost Fees). The money pattern that
// usually sits behind a leak, with the research it comes from. Only shown on leaks that
// have real statement lines; never on Future spend or any prediction. Worded as "a
// common pattern", never as a judgement about the person.
export const BADGE_BIAS = {
  'Trial converted': {
    bias: 'Present Bias',
    line: "Free now feels real, paying later doesn't. That's how trials turn into charges.",
    cite: 'O’Donoghue & Rabin, 1999, American Economic Review',
  },
  'Still using this?': {
    bias: 'Status Quo Bias',
    line: 'Doing nothing is the easiest choice, so auto-renew wins by default.',
    cite: 'Samuelson & Zeckhauser, 1988, Journal of Risk and Uncertainty',
  },
  'Bank fee': {
    bias: 'Denomination Effect',
    line: 'Small amounts feel like nothing, so small fees rarely get questioned.',
    cite: 'Raghubir & Srivastava, 2009, Journal of Consumer Research',
  },
};

// The bias for a leak, only when it is backed by charges on this statement.
export function biasFor(leak) {
  return leak && (leak.rows || []).length > 0 ? BADGE_BIAS[leak.badge] || null : null;
}

// One group per bias: total and number of charges from this statement, and the date span.
export function biasGroups(leaks) {
  const groups = new Map();
  (leaks || []).forEach((leak) => {
    const info = biasFor(leak);
    if (!info) return;
    const group = groups.get(info.bias) || { ...info, badge: leak.badge, total: 0, charges: 0, dates: [] };
    group.total += Number(leak.amount) || 0;
    // Paid charges only: a trial's $0 start isn't a charge (matches "then 6 paid charges").
    const paid = leak.rows.filter((row) => Math.abs(Number(row.amount) || 0) > 0);
    group.charges += paid.length;
    paid.forEach((row) => row.date && group.dates.push(row.date));
    groups.set(info.bias, group);
  });
  return [...groups.values()]
    .map((group) => ({ ...group, total: Math.round(group.total * 100) / 100, from: group.dates.sort()[0], to: group.dates.sort().at(-1) }))
    .sort((a, b) => b.total - a.total);
}
