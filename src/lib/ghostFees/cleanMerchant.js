// Turns a raw bank description into a stable merchant key. Fixed rules only.
// uppercase, remove digits, remove PTY / LTD / AUS / AU / VISA / CARD, collapse spaces.
// "TRIAL" is also dropped so a trial charge groups with the paid plan.

const NOISE_RE = /\b(PTY|LTD|AUS|AU|VISA|CARD|TRIAL)\b/g;

export function cleanMerchant(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[0-9]/g, ' ')
    .replace(/[^A-Z&' ]+/g, ' ')
    .replace(NOISE_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}