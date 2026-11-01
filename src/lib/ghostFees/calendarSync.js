import { base44 } from '@/api/base44Client';
import { money } from './format';
import { nextReminderDate } from './reminder';

// Calendar sync: the reminders someone chooses to sync are saved in a private feed
// (backend function calendarFeed). Their real calendar subscribes to the feed once
// and keeps pulling new reminders on its own. The private token lives here only.
const KEY = 'ghostFees.calendarSync.v1';
const LIVE = 'https://hunt-ghost-fees.base44.app';

export function loadSync() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

function saveSync(value) {
  try {
    if (value) window.localStorage.setItem(KEY, JSON.stringify(value));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage off: the feed still works this visit.
  }
}

const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

// One reminder 2 days before each subscription's next charge.
export const reminderUid = (merchant) => `rem-${slug(merchant)}`;

export function reminderEvents(subscriptions) {
  return subscriptions
    .map((item) => {
      const date = item.lastDate ? nextReminderDate(item.lastDate)?.toISOString().slice(0, 10) : null;
      return date && {
        uid: reminderUid(item.merchant),
        title: `${item.merchant} charges again in 2 days`,
        details: `${item.merchant} costs ${money(item.monthly)} a month. Still using it? Cancel before it renews if not.`,
        date,
      };
    })
    .filter(Boolean);
}

export const taskEvent = (task) => ({ uid: `task-${slug(task.title)}-${task.date}`, title: task.title, details: task.details, date: task.date });

// Adds (or updates) events in the feed and returns the sync state.
export async function syncEvents(events) {
  const current = loadSync();
  const byUid = new Map((current?.events || []).map((event) => [event.uid, event]));
  events.forEach((event) => byUid.set(event.uid, event));
  const all = [...byUid.values()];
  const response = await base44.functions.invoke('calendarFeed', { token: current?.token, events: all });
  const token = response?.data?.token;
  if (!token) throw new Error(response?.data?.error || 'Could not save your reminders.');
  const next = { token, events: all };
  saveSync(next);
  return next;
}

// Takes reminders out of the synced feed (say, once a subscription is cancelled).
// Does nothing if sync isn't on or none of them are in it.
export async function dropEvents(uids) {
  const current = loadSync();
  if (!current) return null;
  const events = (current.events || []).filter((event) => !uids.includes(event.uid));
  if (events.length === (current.events || []).length) return current;
  const response = await base44.functions.invoke('calendarFeed', { token: current.token, events });
  if (!response?.data?.token) throw new Error(response?.data?.error || 'Could not update your reminders.');
  const next = { token: response.data.token, events };
  saveSync(next);
  return next;
}

export async function stopSync() {
  const current = loadSync();
  if (current) await base44.functions.invoke('calendarFeed', { token: current.token, stop: true }).catch(() => {});
  saveSync(null);
}

export function feedLinks(token) {
  const host = window.location.hostname.endsWith('.base44.app') ? window.location.origin : LIVE;
  const https = `${host}/functions/calendarFeed?token=${token}`;
  const webcal = https.replace(/^https?:/, 'webcal:');
  const name = encodeURIComponent('Ghost Fees reminders');
  return {
    https,
    google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${name}`,
    work: `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${name}`,
    apple: webcal,
  };
}
