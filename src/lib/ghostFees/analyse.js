import { cleanMerchant, titleCase } from './cleanMerchant';

const FEE_PHRASES = [
  'ACCOUNT FEE',
  'MONTHLY FEE',
  'LATE PAYMENT',
  'INTERNATIONAL TRANSACTION',
  'FOREIGN CURRENCY',
  'INTEREST CHARGED',
  'OVERDRAWN',
  'DISHONOUR',
  'FEE',
  'ATM',
];

const FEE_MATCHERS = FEE_PHRASES.map((phrase) => ({
  phrase,
  regex: new RegExp(`\\b${phrase.replace(/ /g, '\\s+')}\\b`),
}));

// Transfers between people are not subscriptions.
const NOT_A_SUBSCRIPTION = /\b(PAYID|OSKO|NPP|TRANSFER|SEND MONEY|CASH OUT|REFUND|REVERSAL|SALARY|PAYROLL)\b/;

const FREQUENCY_BANDS = [
  { frequency: 'weekly', label: 'Weekly', min: 6, max: 8, multiplier: 52 },
  { frequency: 'fortnightly', label: 'Fortnightly', min: 13, max: 16, multiplier: 26 },
  { frequency: 'monthly', label: 'Monthly', min: 27, max: 33, multiplier: 12 },
  { frequency: 'yearly', label: 'Yearly', min: 360, max: 370, multiplier: 1 },
];

const DAY = 24 * 60 * 60 * 1000;

export const MIN_HISTORY_DAYS = 88;

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function toTime(date) {
  return new Date(`${date}T00:00:00Z`).getTime();
}

function dayDiff(from, to) {
  return Math.round((toTime(to) - toTime(from)) / DAY);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function mergeTransactions(lists) {
  const seen = new Set();
  const merged = [];

  lists.forEach((list) => {
    (list || []).forEach((item) => {
      const amount = round2(item.amount);
      if (!item.date || !item.description || !Number.isFinite(amount) || amount === 0) return;
      const key = `${item.date}|${amount.toFixed(2)}|${String(item.description).toUpperCase().replace(/\s+/g, ' ').trim()}`;
      if (seen.has(key)) return;
      seen.add(key);
      merged.push({
        date: item.date,
        description: String(item.description).trim(),
        amount,
        clean: cleanMerchant(item.description),
      });
    });
  });

  return merged.sort((a, b) => a.date.localeCompare(b.date));
}

export function dateRange(transactions) {
  if (!transactions.length) return { from: null, to: null, days: 0 };
  const dates = transactions.map((item) => item.date).sort();
  const from = dates[0];
  const to = dates[dates.length - 1];
  return { from, to, days: dayDiff(from, to) + 1 };
}

function detectSubscriptions(transactions) {
  const groups = new Map();

  transactions.forEach((item) => {
    if (item.amount >= 0) return;
    if (!item.clean) return;
    const upper = item.description.toUpperCase();
    if (NOT_A_SUBSCRIPTION.test(upper)) return;
    // Bank fees belong in the fees section, never in subscriptions.
    if (FEE_MATCHERS.some((matcher) => matcher.regex.test(upper))) return;
    if (!groups.has(item.clean)) groups.set(item.clean, []);
    groups.get(item.clean).push(item);
  });

  const subscriptions = [];

  groups.forEach((list, key) => {
    if (list.length < 3) return;
    const ordered = [...list].sort((a, b) => a.date.localeCompare(b.date));

    const gaps = [];
    for (let i = 1; i < ordered.length; i += 1) {
      gaps.push(dayDiff(ordered[i - 1].date, ordered[i].date));
    }
    const gap = median(gaps);
    const band = FREQUENCY_BANDS.find((item) => gap >= item.min && gap <= item.max);
    if (!band) return;

    const amounts = ordered.map((item) => Math.abs(item.amount));
    const middle = median(amounts);
    const spread = (Math.max(...amounts) - Math.min(...amounts)) / (middle || 1);
    if (spread > 0.15) return;

    const firstAmount = round2(amounts[0]);
    const latestAmount = round2(amounts[amounts.length - 1]);
    const increase = round2(latestAmount - firstAmount);
    const isCreep = increase > 0 && (increase >= 0.5 || increase >= firstAmount * 0.05);

    let since = null;
    if (isCreep) {
      const changed = ordered.find((item) => Math.abs(item.amount) >= latestAmount - 0.005);
      since = changed ? changed.date : ordered[ordered.length - 1].date;
    }

    subscriptions.push({
      id: key,
      merchant: titleCase(key),
      frequency: band.frequency,
      frequencyLabel: band.label,
      multiplier: band.multiplier,
      amount: latestAmount,
      firstAmount,
      occurrences: ordered.length,
      lastDate: ordered[ordered.length - 1].date,
      yearlyCost: round2(latestAmount * band.multiplier),
      creep: isCreep
        ? {
            from: firstAmount,
            to: latestAmount,
            since,
            yearlyIncrease: round2(increase * band.multiplier),
          }
        : null,
    });
  });

  return subscriptions.sort((a, b) => b.yearlyCost - a.yearlyCost);
}

function detectFees(transactions, monthsCovered) {
  const groups = new Map();

  transactions.forEach((item) => {
    if (item.amount >= 0) return;
    const upper = item.description.toUpperCase();
    const hit = FEE_MATCHERS.find((matcher) => matcher.regex.test(upper));
    if (!hit) return;

    const key = item.clean || hit.phrase;
    if (!groups.has(key)) {
      groups.set(key, {
        merchant: titleCase(key),
        keyword: titleCase(hit.phrase),
        occurrences: 0,
        total: 0,
        latest: 0,
        latestDate: item.date,
      });
    }
    const group = groups.get(key);
    group.occurrences += 1;
    group.total += Math.abs(item.amount);
    if (item.date >= group.latestDate) {
      group.latestDate = item.date;
      group.latest = Math.abs(item.amount);
    }
  });

  const scale = 12 / Math.max(monthsCovered, 1);

  return Array.from(groups.values())
    .map((group) => ({
      id: `fee:${group.merchant}`,
      merchant: group.merchant,
      keyword: group.keyword,
      frequencyLabel: group.occurrences > 1 ? `${group.occurrences}×` : 'One-off',
      amount: round2(group.latest),
      occurrences: group.occurrences,
      yearlyCost: round2(group.total * scale),
    }))
    .sort((a, b) => b.yearlyCost - a.yearlyCost);
}

export function totalsFor({ subscriptions, fees, priceCreeps }, hidden = new Set()) {
  const activeSubs = subscriptions.filter((item) => !hidden.has(item.id));
  const subscriptionTotal = activeSubs.reduce((sum, item) => sum + item.yearlyCost, 0);
  const creepTotal = priceCreeps
    .filter((item) => !hidden.has(item.subscriptionId))
    .reduce((sum, item) => sum + item.yearlyIncrease, 0);
  const feeTotal = fees.reduce((sum, item) => sum + item.yearlyCost, 0);

  return {
    subscriptions: round2(subscriptionTotal),
    fees: round2(feeTotal),
    creep: round2(creepTotal),
    total: round2(subscriptionTotal + feeTotal + creepTotal),
  };
}

export function analyse(transactions) {
  const range = dateRange(transactions);
  const monthsCovered = Math.max(range.days / 30.44, 0.1);
  const enoughHistory = range.days >= MIN_HISTORY_DAYS;

  const subscriptions = enoughHistory ? detectSubscriptions(transactions) : [];
  const fees = detectFees(transactions, monthsCovered);
  const priceCreeps = subscriptions
    .filter((item) => item.creep)
    .map((item) => ({
      id: `creep:${item.id}`,
      subscriptionId: item.id,
      merchant: item.merchant,
      frequency: item.frequency,
      frequencyLabel: item.frequencyLabel,
      from: item.creep.from,
      to: item.creep.to,
      since: item.creep.since,
      yearlyIncrease: item.creep.yearlyIncrease,
    }))
    .sort((a, b) => b.yearlyIncrease - a.yearlyIncrease);

  return {
    transactions,
    monthsCovered,
    enoughHistory,
    range,
    subscriptions,
    fees,
    priceCreeps,
    totals: totalsFor({ subscriptions, fees, priceCreeps }),
  };
}