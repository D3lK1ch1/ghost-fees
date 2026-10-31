// Turns a raw bank description into a stable merchant key.
// Fixed rules only — same input always gives the same output.

const NOISE_WORDS = [
  'VISA PURCHASE', 'VISA DEBIT', 'EFTPOS DEBIT', 'DIRECT DEBIT', 'DEBIT CARD', 'CREDIT CARD',
  'MASTERCARD', 'EFTPOS', 'PURCHASE', 'PURCHASES', 'PAYMENT', 'PAYMENTS',
  'VISA', 'AMEX', 'DEBIT', 'CREDIT', 'WITHDRAWAL', 'DEPOSIT', 'CARD', 'POS',
  'ONLINE', 'INTERNET', 'MOBILE', 'PTY LTD', 'PTY', 'LIMITED', 'LTD',
  'AUSTRALIA', 'AUST', 'AUS', 'AU',
  'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT',
  'SYDNEY', 'MELBOURNE', 'BRISBANE', 'PERTH', 'ADELAIDE', 'CANBERRA', 'HOBART', 'DARWIN',
  'REFERENCE', 'REF', 'AUTH', 'TXN', 'TRANSACTION', 'ID', 'NO',
];

const NOISE_RES = NOISE_WORDS.map(
  (word) => new RegExp(`\\b${word.replace(/ /g, '\\s+')}\\b`, 'g'),
);

const MONTHS = 'JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC';

export function cleanMerchant(raw) {
  let value = String(raw || '').toUpperCase();

  value = value.replace(/\b\d{1,2}[/\-.]\d{1,2}(?:[/\-.]\d{2,4})?\b/g, ' '); // dates
  value = value.replace(new RegExp(`\\b\\d{1,2}\\s*(?:${MONTHS})[A-Z]*\\b`, 'g'), ' ');
  value = value.replace(/\b(?:X{2,}|\*{2,})\d{0,4}\b/g, ' '); // masked cards
  value = value.replace(/\b(?:\d[ -]?){5,}\d\b/g, ' '); // grouped card numbers
  value = value.replace(/\b\d{4,}\b/g, ' ');

  for (const re of NOISE_RES) value = value.replace(re, ' ');

  value = value.replace(/[^A-Z0-9&' ]+/g, ' ');
  return value.replace(/\s+/g, ' ').trim();
}

export function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      if (word.length <= 3 && /^[bcdfghjklmnpqrstvwxz]+$/.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}