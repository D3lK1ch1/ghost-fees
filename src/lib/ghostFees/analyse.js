import { cleanMerchant, displayName } from './cleanMerchant';
import { money, shortDate } from './format';

const FEE_RE = /\bFEES?\b|\bATM\b|INTERNATIONAL TRANSACTION|LATE PAYMENT|OVERDRAWN/;
const TRIAL_RE = /TRIAL/;
// Never a subscription or a price rise: money moved, not spent on a plan.
const HARD_EXCLUDE_RE = /\bTRANSFER\b|\bSALARY\b|\bWITHDRAWAL\b|TOP ?UP|\bMYKI\b|PUBLIC TRANSPORT/;
const RENT_RE = /\bRESIDENTIAL\b|\bRENT\b/;
const MAX_SUBSCRIPTION = 500;
const DAY = 24 * 60 * 60 * 1000;

// Money lost to borrowing, and fees bolted onto a payment. Recognised so they are
// never mistaken for a merchant, but never reported as a leak.
const BORROWING_RE = /INTEREST CHARGED|PURCHASE INTEREST|AFTERPAY LATE|ZIP FEE|ZIP MONTHLY|HUMM FEE|DISHONOUR|OVERDRAWN/;
const SURCHARGE_RE = /SURCHARGE|SERVICE FEE|CONVENIENCE FEE|CARD FEE/;

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
// With several files, each row remembers which file it came from.
export function mergeTransactions(lists, names = []) {
  const seenBefore = new Set();
  const merged = [];

  lists.forEach((list, listIndex) => {
    const seenHere = new Set();
    const source = lists.length > 1 ? names[listIndex] || null : null;
    (list || []).forEach((item) => {
      const amount = round2(item.amount);
      if (!item.date || !item.description || !Number.isFinite(amount)) return;
      const key = `${item.date}|${amount.toFixed(2)}|${String(item.description).toUpperCase().replace(/\s+/g, ' ').trim()}`;
      if (seenBefore.has(key)) return;
      seenHere.add(key);
      merged.push({
        date: item.date,
        description: String(item.description).trim(),
        amount,
        clean: cleanMerchant(item.description),
        // Which uploaded statement this charge came from, so a leak can point at it.
        source: item.source || source,
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

  // Price creep: exactly two prices, the higher one replacing the lower one.
  if (months.length >= 3 && amounts.length === 2) {
    const [oldPrice, newPrice] = amounts;
    const firstNewIndex = list.findIndex((item) => item.value === newPrice);
    const oldAfterNew = list.slice(firstNewIndex + 1).some((item) => item.value === oldPrice);
    if (firstNewIndex > 0 && !oldAfterNew) {
      const newCharges = list.filter((item) => item.value === newPrice).length;
      const rise = round2(newPrice - oldPrice);
      const since = list[firstNewIndex].date;
      return {
        leak: {
          id: `m:${key}`,
          merchant,
          badge: 'Price creep',
          amount: round2(rise * newCharges),
          monthly: newPrice,
          priceRise: { oldPrice, newPrice, since },
          caption: `extra since ${shortDate(since)}`,
          reason: `Was ${money(oldPrice)}, now ${money(newPrice)} (+${money(rise)}/mo) since ${shortDate(since)}.`,
          action: isSubscription ? 'cancel' : null,
          rows: list.map((item) => statementRow(item, item.value === newPrice, rise)),
        },
        subscription,
      };
    }
  }

  // Duplicate: the same amount charged twice within 2 days, and only for a
  // subscription. A shop that charges whatever you spent is never a duplicate.
  const extraIndexes = new Set();
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      if (dayDiff(list[i].date, list[j].date) > 2) break;
      if (list[i].value > 0 && list[i].value === list[j].value) {
        extraIndexes.add(j);
        break;
      }
    }
  }
  const extras = [...extraIndexes].map((index) => list[index]);
  if (isSubscription && extras.length) {
    return {
      leak: {
        id: `m:${key}`,
        merchant,
        badge: 'Duplicate',
        amount: sumValues(extras),
        monthly: round2(extras[0].value),
        caption: `${extras.length} extra ${extras.length === 1 ? 'charge' : 'charges'}`,
        reason: `${money(extras[0].value)} was charged twice within 2 days, ${extras.length} ${extras.length === 1 ? 'time' : 'times'}.`,
        action: 'refund',
        rows: list.map((item, index) => statementRow(item, extraIndexes.has(index), item.value)),
      },
      subscription,
    };
  }
  return { leak: null, subscription };
}

export function analyse(transactions) {
  const span = monthSpan(transactions);
  const feeGroups = new Map();
  const groups = new Map();

  transactions
    .filter((item) => item.amount <= 0)
    .forEach((item) => {
      const upper = item.description.toUpperCase();
      if (HARD_EXCLUDE_RE.test(upper)) return;
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