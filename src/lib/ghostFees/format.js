const wholeDollars = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

const cents = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(value) {
  return cents.format(Number(value) || 0);
}

export function moneyWhole(value) {
  return wholeDollars.format(Number(value) || 0);
}

export function shortDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function monthsLabel(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function monthRangeLabel(from, to) {
  if (!from || !to) return '';
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const format = (date) => date.toLocaleDateString('en-AU', { month: 'short', timeZone: 'UTC' });
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  return sameYear
    ? `${format(start)} to ${format(end)} ${end.getUTCFullYear()}`
    : `${format(start)} ${start.getUTCFullYear()} to ${format(end)} ${end.getUTCFullYear()}`;
}