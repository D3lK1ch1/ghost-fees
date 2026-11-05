import { useEffect, useState } from 'react';

// Hattie's habit plan (Pack 10). One habit at a time, in this browser only, wiped by
// Clear my data. { patternKey, habitText, startDate, checkIns: [{date, done}], lastPrompt,
// baseline: {patternKey, amount, fromMonth, toMonth} } - no transactions or merchants.
const KEY = 'gf_habit_plan';
export const MO_WALK_SEEN = 'gf_mo_walk_seen';
const EVENT = 'ghostFees:habitPlan';

export function readHabit() {
  try {
    const plan = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    return plan && plan.habitText ? { checkIns: [], ...plan } : null;
  } catch {
    return null;
  }
}

export function writeHabit(plan) {
  try {
    if (plan) window.localStorage.setItem(KEY, JSON.stringify(plan));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage off: works for this visit.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: plan }));
}

export function clearHabit() {
  writeHabit(null);
  try {
    window.localStorage.removeItem(MO_WALK_SEEN);
  } catch {
    // Nothing to clear.
  }
}

export function useHabitPlan() {
  const [plan, setPlan] = useState(() => (typeof window === 'undefined' ? null : readHabit()));
  useEffect(() => {
    const on = () => setPlan(readHabit());
    window.addEventListener(EVENT, on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener(EVENT, on); window.removeEventListener('storage', on); };
  }, []);
  return [plan, writeHabit];
}

// Dates as YYYY-MM-DD in local time.
export const ymdLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00`); d.setDate(d.getDate() + n); return ymdLocal(d); };
export function startChoices(today = new Date()) {
  const t = ymdLocal(today);
  const monday = new Date(today); monday.setDate(today.getDate() + (((8 - today.getDay()) % 7) || 7));
  const first = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return [
    { key: 'tomorrow', label: 'Tomorrow', date: addDays(t, 1) },
    { key: 'monday', label: 'Next Monday', date: ymdLocal(monday) },
    { key: 'first', label: 'The 1st of next month', date: ymdLocal(first) },
  ];
}
export const niceDate = (ymd) => new Date(`${ymd}T12:00:00`).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });

// Check-in is due 7+ days after the start day (or the last check-in), at most once a week.
export function checkInDue(plan, today = new Date()) {
  if (!plan?.startDate) return false;
  const t = ymdLocal(today);
  const last = plan.checkIns?.length ? plan.checkIns[plan.checkIns.length - 1].date : plan.startDate;
  if (t < addDays(last, 7)) return false;
  if (plan.lastPrompt && t < addDays(plan.lastPrompt, 7)) return false;
  return true;
}
export const doneCount = (plan) => (plan?.checkIns || []).filter((c) => c.done).length;
export const isHabitKeeper = (plan) => doneCount(plan) >= 2;

// Two calendar events: a 10-minute start (9 am) and a check-in 7 days later, both
// linking back to /?habit=check. One .ics with both, plus Google and Outlook links.
const APP = 'https://hunt-ghost-fees.base44.app/?habit=check';
const stamp = (ymd, hh = '09', mm = '00') => `${ymd.replace(/-/g, '')}T${hh}${mm}00`;
function eventsFor(plan, ghostName) {
  return [
    { uid: `habit-start-${plan.startDate}`, title: `👻 Start your habit (${ghostName})`, details: `${plan.habitText}\n\nCheck in: ${APP}`, date: plan.startDate },
    { uid: `habit-check-${addDays(plan.startDate, 7)}`, title: `👻 Habit check-in with ${ghostName}`, details: `Did you do it? ${plan.habitText}\n\n${APP}`, date: addDays(plan.startDate, 7) },
  ];
}
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
export function habitIcs(plan, ghostName) {
  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const body = eventsFor(plan, ghostName).map((e) => [
    'BEGIN:VEVENT', `UID:${e.uid}@ghostfees`, `DTSTAMP:${now}`, `DTSTART:${stamp(e.date)}`, `DTEND:${stamp(e.date, '09', '10')}`,
    `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(e.details)}`, `URL:${APP}`, 'END:VEVENT',
  ].join('\r\n')).join('\r\n');
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Ghost Fees//Habit//EN\r\n${body}\r\nEND:VCALENDAR\r\n`;
}
export function downloadHabitIcs(plan, ghostName) {
  const url = URL.createObjectURL(new Blob([habitIcs(plan, ghostName)], { type: 'text/calendar' }));
  const a = document.createElement('a'); a.href = url; a.download = 'ghost-fees-habit.ics'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function habitGoogleUrls(plan, ghostName) {
  return eventsFor(plan, ghostName).map((e) => `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: 'TEMPLATE', text: e.title, details: e.details, dates: `${stamp(e.date)}/${stamp(e.date, '09', '10')}` })}`);
}
export function habitOutlookUrls(plan, ghostName) {
  return eventsFor(plan, ghostName).map((e) => `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({ subject: e.title, body: e.details, startdt: `${e.date}T09:00:00`, enddt: `${e.date}T09:10:00`, path: '/calendar/action/compose', rru: 'addevent' })}`);
}
