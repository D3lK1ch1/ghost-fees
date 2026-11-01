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

// The next date a subscription should charge, rolled forward from its last charge.
export function nextChargeDate(lastDate, today = new Date()) {
  const remind = nextReminderDate(lastDate, today);
  if (!remind) return null;
  const charge = new Date(remind);
  charge.setUTCDate(charge.getUTCDate() + 2);
  return charge;
}

// One calendar file with a reminder for every subscription.
export function downloadAllReminders(subscriptions) {
  const today = new Date();
  const events = subscriptions
    .map((item) => buildIcs(item, today))
    .filter(Boolean)
    .map((ics) => ics.slice(ics.indexOf('BEGIN:VEVENT'), ics.indexOf('END:VCALENDAR')).trim());
  if (!events.length) return;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ghost Fees//Reminder//EN', ...events, 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ghost-fees-reminders.ics';
  link.click();
  URL.revokeObjectURL(url);
}

// A task the person schedules from the calendar popup: any title, any day.
export function buildTaskIcs({ title, details = '', date }, today = new Date()) {
  const start = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const clean = (text) => String(text).replace(/[,;\\\n]/g, ' ');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ghost Fees//Task//EN',
    'BEGIN:VEVENT',
    `UID:${icsDate(start)}-${clean(title).replace(/\s+/g, '-')}@ghostfees`,
    `DTSTAMP:${icsDate(today)}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDate(start)}`,
    `DTEND;VALUE=DATE:${icsDate(end)}`,
    `SUMMARY:${clean(title)}`,
    `DESCRIPTION:${clean(details)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadTask(task) {
  const ics = buildTaskIcs(task);
  if (!ics) return false;
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${task.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

// Google Calendar's "new event" page with the task filled in. Only opened when the
// person taps the button; the task text goes to Google at that moment.
export function googleCalendarUrl({ title, details = '', date }) {
  const start = date.replace(/-/g, '');
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: title, details, dates: `${start}/${icsDate(next)}` });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Outlook (outlook.com / Microsoft 365) "new event" page with the task filled in.
// Opened only when the person taps it; the task text goes to Microsoft then.
export function outlookCalendarUrl({ title, details = '', date }, work = false) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const params = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: title, body: details, startdt: date, enddt: next.toISOString().slice(0, 10), allday: 'true' });
  return `https://outlook.${work ? 'office' : 'live'}.com/calendar/0/deeplink/compose?${params.toString()}`;
}
