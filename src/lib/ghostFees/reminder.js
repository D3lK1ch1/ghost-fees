// Builds a calendar reminder (.ics) for two days before a subscription's next charge.
// Made in the browser and downloaded straight away. Nothing is stored or sent.

const pad = (value) => String(value).padStart(2, '0');
const icsDate = (date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;

export function nextReminderDate(lastDate, today = new Date()) {
  const next = new Date(`${lastDate}T00:00:00Z`);
  if (Number.isNaN(next.getTime())) return null;
  // Roll forward a month at a time until the charge is in the future.
  do next.setUTCMonth(next.getUTCMonth() + 1); while (next <= today);
  next.setUTCDate(next.getUTCDate() - 2);
  return next;
}

export function buildIcs({ merchant, monthly, lastDate }, today = new Date()) {
  const remind = nextReminderDate(lastDate, today);
  if (!remind) return null;
  const end = new Date(remind);
  end.setUTCDate(end.getUTCDate() + 1);
  const name = String(merchant).replace(/[,;\\\n]/g, ' ');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ghost Fees//Reminder//EN',
    'BEGIN:VEVENT',
    `UID:${icsDate(remind)}-${name.replace(/\s+/g, '-')}@ghostfees`,
    `DTSTAMP:${icsDate(today)}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDate(remind)}`,
    `DTEND;VALUE=DATE:${icsDate(end)}`,
    `SUMMARY:${name} charges again in 2 days`,
    `DESCRIPTION:${name} costs $${Number(monthly).toFixed(2)} a month. Still using it? Cancel before it renews if not.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadReminder(subscription) {
  const ics = buildIcs(subscription);
  if (!ics) return;
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${subscription.merchant.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-reminder.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
