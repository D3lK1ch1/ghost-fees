import { cleanMerchant, displayName } from './cleanMerchant';
import { money, shortDate } from './format';

const FEE_RE = /\bFEES?\b|\bATM\b|INTERNATIONAL TRANSACTION|LATE PAYMENT|OVERDRAWN/;
const TRIAL_RE = /TRIAL/;
// Never a subscription or a price rise: money moved, not spent on a plan.
const HARD_EXCLUDE_RE = /\bTRANSFER\b|\bSALARY\b|\bWITHDRAWAL\b|TOP ?UP|\bMYKI\b|PUBLIC TRANSPORT/;
const RENT_RE = /\bRESIDENTIAL\b|\bRENT\b/;
const MAX_SUBSCRIPTION = 500;
const DAY = 24 * 60 * 60 * 1000;

// Services that do the same job. Two or more active at once is an overlap.
const OVERLAP_CATEGORIES = [
  { key: 'streaming', label: 'streaming', re: /\b(NETFLIX|STAN|BINGE|DISNEY|PARAMOUNT|PRIME VIDEO|APPLE TV|KAYO|FOXTEL)\b/ },
  { key: 'music', label: 'music', re: /\b(SPOTIFY|APPLE MUSIC|YOUTUBE MUSIC|TIDAL)\b/ },
  { key: 'cloud', label: 'cloud storage', re: /\b(ICLOUD|GOOGLE ONE|DROPBOX|ONEDRIVE)\b/ },
];

// Money lost to borrowing, and fees bolted onto a payment.
const BORROWING_RE = /INTEREST CHARGED|PURCHASE INTEREST|AFTERPAY LATE|ZIP FEE|ZIP MONTHLY|HUMM FEE|DISHONOUR|OVERDRAWN/;

// Money arriving as pay, used only to show a total as hours of work.
const INCOME_RE = /\bSALARY\b|\bPAYROLL\b|\bWAGES\b|\bPAY\b/;
const SURCHARGE_RE = /SURCHARGE|SERVICE FEE|CONVENIENCE FEE|CARD FEE/;

const COST_TYPES = {
  borrowing: {
    badge: 'Borrowing cost',
    reason: (count, months) => `${count} ${count === 1 ? 'charge' : 'charges'} for borrowing money over ${months} ${months === 1 ? 'month' : 'months'}.`,
    tip: 'Tip: clearing the balance in full each month stops this charge.',
  },
  surcharge: {
    badge: 'Surcharge',
    reason: (count, months) => `${count} ${count === 1 ? 'surcharge' : 'surcharges'} added on top of your payments over ${months} ${months === 1 ? 'month' : 'months'}.`,
    tip: 'Tip: pay by bank transfer or a savings account card where it is offered.',
  },
};

export const MIN_MONTHS = 6;

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
        description: String(item.description).trim(),
        amount,
        clean: cleanMerchant(item.description),
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

function costLeak(key, list, type) {
  const amount = sumValues(list);
  if (amount <= 0) return null;
  const config = COST_TYPES[type];
  const months = distinctMonths(list).length;
  return {
    id: `${type}:${key}`,
    merchant: displayName(key),
    badge: config.badge,
    amount,
    caption: `${list.length} ${list.length === 1 ? 'charge' : 'charges'}`,
    reason: config.reason(list.length, months),
    tip: config.tip,
    action: null,
    rows: list.map((item) => statementRow(item, true, item.value)),
  };
}

// Two or more services doing the same job. The cheapest ones beyond the first
// only count for the months they overlapped.
function overlapLeaks(groups) {
  const byCategory = new Map();

  groups.forEach((list, key) => {
    const category = OVERLAP_CATEGORIES.find((item) => item.re.test(key.toUpperCase()));
    if (!category) return;
    const months = distinctMonths(list);
    if (months.length < 2) return;
    if (!byCategory.has(category.key)) byCategory.set(category.key, { category, members: [] });
    byCategory.get(category.key).members.push({ key, list, months });
  });

  const leaks = [];
  const latestValue = (member) => member.list[member.list.length - 1].value;

  byCategory.forEach(({ category, members }) => {
    if (members.length < 2) return;

    const sorted = [...members].sort((a, b) => latestValue(b) - latestValue(a));
    const keep = sorted[0];
    const dropped = sorted.slice(1);
    const keepMonths = new Set(keep.months);

    const rows = [];
    let amount = 0;
    dropped.forEach((member) => {
      member.list.forEach((item) => {
        if (!keepMonths.has(monthKey(item.date))) return;
        amount += item.value;
        rows.push(statementRow(item, true, item.value));
      });
    });
    if (amount <= 0) return;

    const names = members.map((member) => displayName(member.key));
    const monthly = round2(members.reduce((sum, member) => sum + latestValue(member), 0));
    const droppedMonthly = round2(dropped.reduce((sum, member) => sum + latestValue(member), 0));

    leaks.push({
      id: `overlap:${category.key}`,
      title: `${members.length} ${category.label} services`,
      merchant: displayName(keep.key),
      badge: 'Overlap',
      amount: round2(amount),
      monthly: droppedMonthly,
      caption: `${money(monthly)}/mo all up`,
      reason: `${names.join(', ')} all charge you each month. The extra ones come to ${money(droppedMonthly)}/mo.`,
      action: 'cancel',
      targets: dropped.map((member) => ({
        merchant: displayName(member.key),
        monthly: round2(latestValue(member)),
      })),
      rows: rows.sort((a, b) => a.date.localeCompare(b.date)),
    });
  });

  return leaks;
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
    ? { id: `m:${key}`, merchant, monthly: round2(latest.value) }
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

  // Duplicate: the same amount charged twice within 2 days. Only the extras count.
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
  if (extras.length) {
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
  const borrowGroups = new Map();
  const surchargeGroups = new Map();
  const groups = new Map();

  transactions
    .filter((item) => item.amount <= 0)
    .forEach((item) => {
      const upper = item.description.toUpperCase();
      if (HARD_EXCLUDE_RE.test(upper)) return;
      const debit = { ...item, value: Math.abs(item.amount) };
      if (BORROWING_RE.test(upper)) push(borrowGroups, item.clean || 'BORROWING COST', debit);
      else if (SURCHARGE_RE.test(upper)) push(surchargeGroups, item.clean || 'SURCHARGE', debit);
      else if (FEE_RE.test(upper)) push(feeGroups, item.clean || 'BANK FEE', debit);
      else if (item.clean) push(groups, item.clean, debit);
    });

  const leaks = [];
  const subscriptions = [];

  feeGroups.forEach((list, key) => {
    const leak = feeLeak(key, list);
    if (leak) leaks.push(leak);
  });

  borrowGroups.forEach((list, key) => {
    const leak = costLeak(key, list, 'borrowing');
    if (leak) leaks.push(leak);
  });

  surchargeGroups.forEach((list, key) => {
    const leak = costLeak(key, list, 'surcharge');
    if (leak) leaks.push(leak);
  });

  groups.forEach((list, key) => {
    const result = merchantLeak(key, list);
    if (result.leak) leaks.push(result.leak);
    if (result.subscription) subscriptions.push(result.subscription);
  });

  leaks.push(...overlapLeaks(groups));

  leaks.forEach((leak) => { leak.months = span; });
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