import { cleanMerchant, displayName } from './cleanMerchant';
import { money, shortDate } from './format';

const FEE_RE = /\bFEES?\b|\bATM\b|INTERNATIONAL TRANSACTION|LATE PAYMENT|OVERDRAWN|DISHONOU?R|\b(ACCOUNT|SERVICE|MONTHLY|KEEPING|MAINTENANCE) CHARGES?\b/;
const TRIAL_RE = /TRIAL/;
// Never a subscription or a price rise: money moved, not spent on a plan.
const HARD_EXCLUDE_RE = /\bTRANSFER\b|\bSALARY\b|\bWITHDRAWAL\b|TOP ?UP|\bMYKI\b|PUBLIC TRANSPORT/;
const RENT_RE = /\bRESIDENTIAL\b|\bRENT\b/;
const MAX_SUBSCRIPTION = 500;
const DAY = 24 * 60 * 60 * 1000;

// Interest, buy-now-pay-later fees and shop surcharges are not reported as leaks.
// Bank fees that merely sound similar (service fee, card fee, overdrawn, dishonour)
// are not in this list, so they still reach the bank-fee check.
const BORROWING_RE = /INTEREST CHARGED|PURCHASE INTEREST|AFTERPAY LATE|ZIP FEE|ZIP MONTHLY|HUMM FEE/;
const SURCHARGE_RE = /\bSURCHARGE\b|CONVENIENCE FEE/;

// Long digit runs (card, account or reference numbers) are masked to the last 4.
function scrub(text) {
  return String(text).replace(/\b(?:\d[ -]?){6,}\d\b/g, (digits) => `••••${digits.replace(/\D/g, '').slice(-4)}`);
}

// Money arriving as pay, used only to show a total as hours of work.
const INCOME_RE = /\bSALARY\b|\bPAYROLL\b|\bWAGES\b|\bPAY\b/;

export const MIN_MONTHS = 3;

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function dayDiff(from, to) {
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / DAY);
}

function monthKey(date) {
  return date.slice(0, 7);
}

function sumValues(list) {
  return round2(list.reduce((sum, item) => sum + item.value, 0));
}

function distinctMonths(list) {
  return [...new Set(list.map((item) => monthKey(item.date)))].sort();
}

function distinctAmounts(list) {
  return [...new Set(list.map((item) => item.value.toFixed(2)))].map(Number).sort((a, b) => a - b);
}

// Calendar months from the first to the last transaction, inclusive.
function monthSpan(transactions) {
  if (!transactions.length) return 0;
  const dates = transactions.map((item) => item.date).sort();
  const [y1, m1] = dates[0].split('-').map(Number);
  const [y2, m2] = dates[dates.length - 1].split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1) + 1;
}

// Combine files, dropping rows that already appeared in an earlier file.
// Repeats inside one file are real repeat charges, so they stay.
export function mergeTransactions(lists) {
  const seenBefore = new Set();
  const merged = [];

  lists.forEach((list) => {
    const seenHere = new Set();
    (list || []).forEach((item) => {
      const amount = round2(item.amount);
      if (!item.date || !item.description || !Number.isFinite(amount)) return;
      const key = `${item.date}|${amount.toFixed(2)}|${String(item.description).toUpperCase().replace(/\s+/g, ' ').trim()}`;
      if (seenBefore.has(key)) return;
      seenHere.add(key);
      merged.push({
        date: item.date,
        description: scrub(String(item.description).trim()),
        amount,
        clean: cleanMerchant(item.description),
        // Which uploaded statement this charge came from, so a leak can point at it.
        source: item.source || null,
      });
    });
    seenHere.forEach((key) => seenBefore.add(key));
  });

  return merged.sort((a, b) => a.date.localeCompare(b.date));
}

function push(map, key, item) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(item);
}

function statementRow(item, wasted, wastedAmount) {
  return {
    date: item.date,
    description: item.description,
    amount: round2(item.value),
    source: item.source || null,
    wasted,
    wastedAmount: wasted ? round2(wastedAmount) : 0,
  };
}

function feeLeak(key, list) {
  const amount = sumValues(list);
  if (amount <= 0) return null;
  const count = list.length;
  return {
    id: `fee:${key}`,
    merchant: displayName(key),
    badge: 'Bank fee',
    amount,
    caption: `${count} ${count === 1 ? 'charge' : 'charges'}`,
    reason: `${count} fee ${count === 1 ? 'charge' : 'charges'} on your statement.`,
    action: 'waive',
    rows: list.map((item) => statementRow(item, true, item.value)),
  };
}

// One merchant's charges. Returns the wasted gap (if any) and, when the
// merchant is a subscription, its current monthly price.
function merchantLeak(key, list) {
  const months = distinctMonths(list);
  const amounts = distinctAmounts(list);
  const raw = list.map((item) => item.description.toUpperCase()).join(' | ');
  const merchant = displayName(key);
  const latest = list[list.length - 1];

  if (HARD_EXCLUDE_RE.test(raw)) return { leak: null, subscription: null };

  const overCap = list.some((item) => item.value > MAX_SUBSCRIPTION);
  const isRent = RENT_RE.test(raw);
  const isSubscription = months.length >= 3 && amounts.length <= 2 && !overCap && !isRent;

  const subscription = isSubscription
    ? { id: `m:${key}`, merchant, monthly: round2(latest.value), lastDate: latest.date }
    : null;

  // Trial converted: everything paid after the free charge was wasted.
  const trialIndex = list.findIndex((item) => item.value === 0 || TRIAL_RE.test(item.description.toUpperCase()));
  if (trialIndex >= 0) {
    const trial = list[trialIndex];
    const paid = list.filter((item) => item.date > trial.date && item.value > 0 && !TRIAL_RE.test(item.description.toUpperCase()));
    if (paid.length) {
      const price = round2(paid[paid.length - 1].value);
      return {
        leak: {
          id: `m:${key}`,
          merchant,
          badge: 'Trial converted',
          amount: sumValues(paid),
          monthly: price,
          caption: 'paid after trial',
          reason: `Free trial on ${shortDate(trial.date)}, then ${paid.length} paid ${paid.length === 1 ? 'charge' : 'charges'}.`,
          action: 'cancel',
          rows: list.map((item) => statementRow(
            item,
            item.value > 0 && item.date > trial.date && !TRIAL_RE.test(item.description.toUpperCase()),
            item.value,
          )),
        },
        subscription,
      };
    }
  }

  // Duplicate: the same amount charged twice within 2 days, and only for a
  // subscription. A shop that charges whatever you spent is never a duplicate.
  // Only the extras count.
  const extraIndexes = new Set();
  for (let i = 0; isSubscription && i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      if (dayDiff(list[i].date, list[j].date) > 2) break;
      if (list[i].value > 0 && list[i].value === list[j].value) {
        extraIndexes.add(j);
        break;
      }
    }
  }
  const extras = [...extraIndexes].map((index) => list[index]);
  const dupAmount = sumValues(extras);

  // Price creep: exactly two prices among the non-duplicate charges, the higher replacing the lower.
  const regular = list.filter((_, index) => !extraIndexes.has(index));
  const regularAmounts = distinctAmounts(regular);
  let creep = null;
  if (distinctMonths(regular).length >= 3 && regularAmounts.length === 2) {
    const [oldPrice, newPrice] = regularAmounts;
    const firstNewIndex = regular.findIndex((item) => item.value === newPrice);
    const oldAfterNew = regular.slice(firstNewIndex + 1).some((item) => item.value === oldPrice);
    if (firstNewIndex > 0 && !oldAfterNew) {
      const rise = round2(newPrice - oldPrice);
      creep = {
        oldPrice,
        newPrice,
        rise,
        since: regular[firstNewIndex].date,
        amount: round2(rise * regular.filter((item) => item.value === newPrice).length),
      };
    }
  }

  if (!creep && !extras.length) return { leak: null, subscription };

  const parts = [];
  if (creep) parts.push(`Was ${money(creep.oldPrice)}, now ${money(creep.newPrice)} (+${money(creep.rise)}/mo) since ${shortDate(creep.since)}.`);
  if (extras.length) {
    const dates = extras.slice(0, 3).map((item) => shortDate(item.date)).join(', ');
    const more = extras.length > 3 ? ` and ${extras.length - 3} more` : '';
    parts.push(`${money(extras[0].value)} was charged twice within 2 days, ${extras.length} ${extras.length === 1 ? 'time' : 'times'} (${dates}${more}).`);
  }

  const creepBigger = creep && creep.amount >= dupAmount;

  return {
    leak: {
      id: `m:${key}`,
      merchant,
      badge: creep && !extras.length ? 'Price creep' : !creep ? 'Duplicate' : creepBigger ? 'Price creep' : 'Duplicate',
      extraBadge: creep && extras.length ? (creepBigger ? 'Duplicate' : 'Price creep') : null,
      amount: round2((creep ? creep.amount : 0) + dupAmount),
      monthly: creep ? creep.newPrice : round2(extras[0].value),
      priceRise: creep ? { oldPrice: creep.oldPrice, newPrice: creep.newPrice, since: creep.since } : null,
      caption: creep && !extras.length ? `extra since ${shortDate(creep.since)}` : extras.length && !creep ? `${extras.length} extra ${extras.length === 1 ? 'charge' : 'charges'}` : 'extra charges',
      reason: parts.join(' '),
      action: extras.length ? 'refund' : (isSubscription ? 'cancel' : null),
      rows: list.map((item, index) => {
        if (extraIndexes.has(index)) return statementRow(item, true, item.value);
        if (creep && item.value === creep.newPrice) return statementRow(item, true, creep.rise);
        return statementRow(item, false, 0);
      }),
    },
    subscription,
  };
}

export function analyse(transactions) {
  const span = monthSpan(transactions);
  const feeGroups = new Map();
  const groups = new Map();

  transactions
    .filter((item) => item.amount <= 0)
    .forEach((item) => {
      const upper = item.description.toUpperCase();
      if (HARD_EXCLUDE_RE.test(upper) && !/\bFEES?\b/.test(upper)) return;
      // Borrowing costs and surcharges are not leaks we report.
      if (BORROWING_RE.test(upper) || SURCHARGE_RE.test(upper)) return;
      const debit = { ...item, value: Math.abs(item.amount) };
      if (FEE_RE.test(upper)) push(feeGroups, item.clean || 'BANK FEE', debit);
      else if (item.clean) push(groups, item.clean, debit);
    });

  const leaks = [];
  const subscriptions = [];

  feeGroups.forEach((list, key) => {
    const leak = feeLeak(key, list);
    if (leak) leaks.push(leak);
  });

  groups.forEach((list, key) => {
    const result = merchantLeak(key, list);
    if (result.leak) leaks.push(result.leak);
    if (result.subscription) subscriptions.push(result.subscription);
  });

  leaks.forEach((leak) => {
    leak.months = span;
    // The dates and statements behind the wasted charges, for the card's source line.
    const wastedRows = (leak.rows || []).filter((row) => row.wasted);
    const basis = wastedRows.length ? wastedRows : leak.rows || [];
    leak.dates = [...new Set(basis.map((row) => row.date))].sort();
    leak.sources = [...new Set(basis.map((row) => row.source).filter(Boolean))];
  });
  subscriptions.forEach((item) => { item.months = span; });
  leaks.sort((a, b) => b.amount - a.amount);
  subscriptions.sort((a, b) => b.monthly - a.monthly);

  const sortedDates = transactions.map((item) => item.date).sort();

  // Pay deposits only, for the "hours of your work" line. Never stored.
  const pay = transactions.filter((item) => item.amount > 0 && INCOME_RE.test(item.description.toUpperCase()));
  const monthlyIncome = pay.length && span
    ? round2(pay.reduce((sum, item) => sum + item.amount, 0) / span)
    : null;

  return {
    monthlyIncome,
    leaks,
    subscriptions,
    total: round2(leaks.reduce((sum, leak) => sum + leak.amount, 0)),
    monthSpan: span,
    firstDate: sortedDates[0] || null,
    lastDate: sortedDates[sortedDates.length - 1] || null,
    enoughHistory: span >= MIN_MONTHS,
    transactionCount: transactions.length,
  };
}