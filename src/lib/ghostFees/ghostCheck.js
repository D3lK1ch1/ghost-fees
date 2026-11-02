import { cleanMerchant } from './cleanMerchant';

// Monthly ghost check: when a new statement is scanned, look at every Ghost List
// item still "Requested" and see whether that merchant charged again after the
// day it was ghosted. All in the browser; nothing is sent anywhere.
//   charged after the request date             -> "charging" (Still charging)
//   no charge, and the statement runs 35+ days past the request date -> "confirmed"
//   otherwise (statement too short to tell)    -> unchanged
const CONFIRM_DAYS = 35;
const DAY = 86400000;
const niceDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

// Same key the scan groups by (subscription ids are "m:" + cleanMerchant key).
const keyOf = (item) => (String(item.id || '').startsWith('m:') ? String(item.id).slice(2) : cleanMerchant(item.merchant));

export function checkGhosts(items = [], transactions = []) {
  const lastDate = transactions.reduce((latest, row) => (row.date > latest ? row.date : latest), '');
  const changes = [];
  const next = items.map((item) => {
    if (item.status !== 'requested' || !item.date) return item;
    const key = keyOf(item);
    const since = String(item.date).slice(0, 10);
    const charges = transactions
      .filter((row) => row.amount < 0 && (row.clean ?? cleanMerchant(row.description)) === key && row.date > since)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (charges.length) {
      const on = charges[charges.length - 1].date;
      changes.push({ kind: 'charging', merchant: item.merchant, date: on });
      return { ...item, status: 'charging', checkNote: `Charged again on ${niceDate(on)}, by your statement` };
    }
    const covered = (Date.parse(lastDate) - Date.parse(since)) / DAY;
    if (Number.isFinite(covered) && covered >= CONFIRM_DAYS) {
      changes.push({ kind: 'confirmed', merchant: item.merchant });
      return { ...item, status: 'confirmed', checkNote: 'Confirmed by your statement' };
    }
    return item;
  });
  return { items: next, changes };
}
