// A seven month sample statement so people can see the whole flow instantly.
const pad = (n) => String(n).padStart(2, '0');

function buildSample() {
  const rows = [];
  const add = (month, day, amount, description) => {
    rows.push(`2026-${pad(3 + month)}-${pad(day)},${amount.toFixed(2)},${description}`);
  };

  for (let m = 0; m < 7; m += 1) {
    add(m, 1, -15, 'MONTHLY ACCOUNT FEE');
    add(m, 3, -45, 'FITLIFE GYM CARD XX4412');
    add(m, 5, m < 4 ? -12.99 : -14.99, 'SPOTIFY AB STOCKHOLM');
    add(m, 12, m === 0 ? 0 : -18.99, m === 0 ? 'STREAMMAX TRIAL SYDNEY' : 'STREAMMAX PREMIUM SYDNEY');
    add(m, 15, 2450, 'SALARY PAYMENT ACME PTY LTD');
    add(m, 18, -4.49, 'ICLOUD STORAGE');
    add(m, 20, -29.99, 'ADOBE CREATIVE CLOUD');
    if (m === 2 || m === 4) add(m, 21, -29.99, 'ADOBE CREATIVE CLOUD');
  }
  add(1, 9, -21.2, 'UBER EATS AUS');
  add(4, 26, -12, 'LATE PAYMENT FEE');
  add(5, 24, -15, 'ATM WITHDRAWAL SYDNEY');

  return `Date,Amount,Description\n${rows.sort().join('\n')}`;
}

export const SAMPLE_CSV = buildSample();