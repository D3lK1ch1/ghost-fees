import { cleanMerchant, titleCase } from './cleanMerchant';
import { money, shortDate } from './format';

const FEE_RE = /\bFEES?\b|\bATM\b|INTERNATIONAL TRANSACTION|LATE PAYMENT|OVERDRAWN/;
const TRIAL_RE = /TRIAL/;
const DAY = 24 * 60 * 60 * 1000;

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

function feeLeak(key, list, span) {
  const total = list.reduce((sum, item) => sum + item.value, 0);
  const yearly = round2((total * 12) / Math.max(span, 1));
  if (yearly <= 0) return null;
  return {
    id: `fee:${key}`,
    merchant: titleCase(key),
    badge: 'Bank fee',
    monthly: round2(yearly / 12),
    yearly,
    reason: `${list.length} fee ${list.length === 1 ? 'charge' : 'charges'} totalling ${money(total)}, scaled to 12 months.`,
  };
}

function merchantLeak(key, list) {
  const totals = new Map();
  list.forEach((item) => totals.set(monthKey(item.date), (totals.get(monthKey(item.date)) || 0) + item.value));
  const months = [...totals.keys()].sort();
  const recurring = months.length >= 3;
  const base = { id: `m:${key}`, merchant: titleCase(key) };

  // Trial converted
  const trialIndex = list.findIndex((item) => item.value === 0 || TRIAL_RE.test(item.description.toUpperCase()));
  if (trialIndex >= 0) {
    const trial = list[trialIndex];
    const paid = list.filter(
      (item) => item.date > trial.date && item.value > 0 && !TRIAL_RE.test(item.description.toUpperCase()),
    );
    if (paid.length) {
      const price = paid[paid.length - 1].value;
      return {
        ...base,
        badge: 'Trial converted',
        monthly: price,
        yearly: round2(price * 12),
        reason: `Free trial on ${shortDate(trial.date)} turned into ${money(price)} charges.`,
      };
    }
  }

  // Price creep: compare the first and latest monthly totals
  if (recurring) {
    const first = totals.get(months[0]);
    const last = totals.get(months[months.length - 1]);
    const diff = round2(last - first);
    if (diff >= 0.5) {
      const changedMonth = months.find((month) => totals.get(month) >= last - 0.005);
      const changeDate = list.find((item) => monthKey(item.date) === changedMonth)?.date;
      return {
        ...base,
        badge: 'Price creep',
        monthly: round2(last),
        yearly: round2(diff * 12),
        reason: `Was ${money(first)}, now ${money(last)} since ${shortDate(changeDate)}.`,
      };
    }
  }

  // Duplicate: same amount within 2 days, in 2+ different months
  const dupMonths = new Set();
  let dupAmount = 0;
  for (let i = 1; i < list.length; i += 1) {
    const a = list[i - 1];
    const b = list[i];
    if (b.value > 0 && a.value === b.value && dayDiff(a.date, b.date) <= 2) {
      dupMonths.add(monthKey(b.date));
      dupAmount = b.value;
    }
  }
  if (dupMonths.size >= 2) {
    return {
      ...base,
      badge: 'Duplicate',
      monthly: dupAmount,
      yearly: round2(dupAmount * 12),
      reason: `Charged ${money(dupAmount)} twice within 2 days in ${dupMonths.size} months.`,
    };
  }

  if (recurring) {
    const sum = [...totals.values()].reduce((a, b) => a + b, 0);
    const monthly = round2(sum / months.length);
    if (monthly <= 0) return null;
    return {
      ...base,
      badge: 'Still using this?',
      monthly,
      yearly: round2(monthly * 12),
      reason: `Charged in ${months.length} different months.`,
    };
  }

  return null;
}

export function analyse(transactions) {
  const span = monthSpan(transactions);
  const feeGroups = new Map();
  const groups = new Map();

  transactions
    .filter((item) => item.amount <= 0)
    .forEach((item) => {
      const debit = { ...item, value: Math.abs(item.amount) };
      if (FEE_RE.test(item.description.toUpperCase())) push(feeGroups, item.clean || 'BANK FEE', debit);
      else if (item.clean) push(groups, item.clean, debit);
    });

  const leaks = [];
  feeGroups.forEach((list, key) => {
    const leak = feeLeak(key, list, span);
    if (leak) leaks.push(leak);
  });
  groups.forEach((list, key) => {
    const leak = merchantLeak(key, list);
    if (leak && leak.yearly > 0) leaks.push(leak);
  });

  leaks.sort((a, b) => b.yearly - a.yearly);

  return {
    leaks,
    total: round2(leaks.reduce((sum, leak) => sum + leak.yearly, 0)),
    monthSpan: span,
    enoughHistory: span >= MIN_MONTHS,
    transactionCount: transactions.length,
  };
}