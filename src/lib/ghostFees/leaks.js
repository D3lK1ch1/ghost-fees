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
    key: 'present_bias', bias: 'Present Bias', evidence: 'strong',
    line: "Free now feels real, paying later doesn't. That's how trials turn into charges.",
    what: 'We value now much more than later.',
    why: 'A free trial costs nothing today, and the bill is a future problem.',
    beat: 'When I start a free trial, I will set a reminder 2 days before it ends.',
    beatAction: 'reminder',
    cite: 'O’Donoghue & Rabin, 1999, American Economic Review',
    paper: 'O’Donoghue, T. & Rabin, M. (1999). Doing it now or later. American Economic Review, 89(1), 103-124.',
    url: 'https://doi.org/10.1257/aer.89.1.103',
  },
  'Bank fee': {
    key: 'denomination', bias: 'Denomination Effect', evidence: 'medium',
    line: 'Small amounts feel like nothing, so small fees rarely get questioned.',
    what: 'Small amounts get spent more easily than big ones.',
    why: '$5 here and $10 there never feels worth a phone call.',
    beat: 'When I see a bank fee, I will ask once for it to be waived.',
    beatAction: 'waive',
    cite: 'Raghubir & Srivastava, 2009, Journal of Consumer Research',
    paper: 'Raghubir, P. & Srivastava, J. (2009). The denomination effect. Journal of Consumer Research, 36(4), 701-713.',
    url: 'https://doi.org/10.1086/599222',
  },
  'Price creep': {
    key: 'status_quo', bias: 'Status Quo Bias', evidence: 'strong',
    line: 'Staying put is the default, so a small price rise rarely makes us switch.',
    what: 'We stick with what we already have.',
    why: 'Switching takes effort, and a $2 rise feels too small to bother.',
    beat: "When a price goes up, I will check if I'd still sign up at the new price.",
    beatAction: 'cancel',
    cite: 'Samuelson & Zeckhauser, 1988, Journal of Risk and Uncertainty',
    paper: 'Samuelson, W. & Zeckhauser, R. (1988). Status quo bias in decision making. Journal of Risk and Uncertainty, 1(1), 7-59.',
    url: 'https://doi.org/10.1007/BF00055564',
  },
  Duplicate: {
    key: 'ostrich', bias: 'Ostrich Effect', evidence: 'medium',
    line: 'When money news might be bad, we look less, so double charges slip through.',
    what: 'We look away from money news that might be bad.',
    why: 'Checking a statement can feel stressful, so we skip it.',
    beat: 'On the 1st of each month, I will scan my statement for doubles.',
    beatAction: 'review',
    cite: 'Karlsson, Loewenstein & Seppi, 2009, Journal of Risk and Uncertainty',
    paper: 'Karlsson, N., Loewenstein, G. & Seppi, D. (2009). The ostrich effect: Selective attention to information. Journal of Risk and Uncertainty, 38(2), 95-115.',
    url: 'https://doi.org/10.1007/s11166-009-9060-6',
  },
  Overlap: {
    key: 'mental_accounting', bias: 'Mental Accounting', evidence: 'medium',
    line: "Each app sits in its own mental box, so two that do the same job don't feel like a double-up.",
    what: 'We keep money in separate mental boxes.',
    why: 'Each app has its own box, so overlaps hide.',
    beat: 'When I add a new app, I will check what it overlaps with.',
    beatAction: 'subscriptions',
    cite: 'Thaler, 1999, Journal of Behavioral Decision Making',
    paper: 'Thaler, R. H. (1999). Mental accounting matters. Journal of Behavioral Decision Making, 12(3), 183-206.',
    url: 'https://doi.org/10.1002/(SICI)1099-0771(199909)12:3%3C183::AID-BDM318%3E3.0.CO;2-F',
  },
  'Borrowing cost': {
    key: 'pain_of_paying', bias: 'Pain of Paying', evidence: 'medium',
    line: 'Paying later on credit hurts less than paying now, so interest is easy to miss.',
    what: 'Paying by credit hurts less than paying with cash.',
    why: 'The cost arrives later and feels less real.',
    beat: 'When I pay on credit, I will check the interest line on my statement.',
    beatAction: null,
    cite: 'Prelec & Loewenstein, 1998, Marketing Science',
    paper: 'Prelec, D. & Loewenstein, G. (1998). The red and the black: Mental accounting of savings and debt. Marketing Science, 17(1), 4-28.',
    url: 'https://doi.org/10.1287/mksc.17.1.4',
  },
  // Surcharge: no pattern on purpose. Still using this? isn't made by the analyser.
};

// "How to beat it" lines use implementation intentions (one mention, in the tab footer).
export const PATTERN_FOOTER_REF = 'Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist, 54(7), 493-503.';
export const PATTERN_BY_KEY = Object.fromEntries(Object.entries(BADGE_BIAS).map(([badge, p]) => [p.key, { ...p, badge }]));

// The statement lines that make up a leak, with the leaked part of each.
export function leakRows(leak) {
  const rows = (leak?.rows || []).filter((row) => Math.abs(Number(row.wastedAmount) || 0) > 0);
  return rows.length ? rows : (leak?.rows || []).filter((row) => Math.abs(Number(row.amount) || 0) > 0);
}

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
    const group = groups.get(info.bias) || { ...info, badge: leak.badge, total: 0, charges: 0, dates: [], leakIds: [] };
    group.leakIds.push(leak.id);
    group.total += Number(leak.amount) || 0;
    // The charges that make up the leak (wastedAmount > 0): a trial's $0 start, the full
    // first copy of a duplicate and the old part of a price rise aren't the leak.
    const paid = leakRows(leak);
    group.charges += paid.length;
    paid.forEach((row) => row.date && group.dates.push(row.date));
    groups.set(info.bias, group);
  });
  return [...groups.values()]
    .map((group) => ({ ...group, total: Math.round(group.total * 100) / 100, from: group.dates.sort()[0], to: group.dates.sort().at(-1) }))
    .sort((a, b) => b.total - a.total);
}
