// Turns a raw bank description into a stable merchant key. Fixed rules only.
// uppercase, remove digits, drop company suffixes, city/country words and card noise, collapse spaces.
// "TRIAL" is also dropped so a trial charge groups with the paid plan.

const NOISE_RE = /\b(PTY|LTD|AB|AUS|AU|VISA|CARD|TRIAL|FREE|SUBSCRIPTION|PREMIUM|XX|SYDNEY|MELBOURNE|BRISBANE|PERTH|ADELAIDE|CANBERRA|HOBART|DARWIN|NEWCASTLE|GOLD COAST|AUSTRALIA|STOCKHOLM|LONDON|DUBLIN|SINGAPORE|TORONTO|NEW YORK|SAN FRANCISCO|SEATTLE|SWEDEN|IRELAND|UK|USA|NZ)\b/g;

export function cleanMerchant(raw) {
  return String(raw || '')
    .toUpperCase()
    // Reference codes mixing letters and 2+ digits (P0A1B2C3, XX4412) are noise, not part of the name.
    .replace(/\b(?=[A-Z0-9]*[A-Z])(?=(?:[A-Z]*[0-9]){2})[A-Z0-9]+\b/g, ' ')
    .replace(/[0-9]/g, ' ')
    .replace(/[^A-Z&' ]+/g, ' ')
    .replace(NOISE_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// How a merchant reads on screen. Grouping stays exactly as cleaned above;
// this only drops web noise so "NETFLIX COM" reads as "Netflix".
const DISPLAY_NOISE_RE = /\b(COM|NET|WWW|CO)\b/g;

export function displayName(key) {
  return titleCase(
    String(key || '')
      .replace(DISPLAY_NOISE_RE, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

export function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}