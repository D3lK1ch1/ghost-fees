import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// A private calendar feed people subscribe to in Google, Outlook or Apple Calendar,
// so reminders added in Ghost Fees show up in their real calendar on their own.
//   GET  ?token=...                      -> the feed (text/calendar)
//   POST { token?, events }              -> save the reminders, returns the token
//   POST { token, stop: true }           -> delete the feed
// Only what the person chose to sync is kept: a title, short details and a date.

const TOKEN = /^[a-f0-9]{32,64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (value, max) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
const ics = (value) => clean(value, 300).replace(/[\;,]/g, (c) => `\\${c}`);
const day = (date) => date.replace(/-/g, '');
const nextDay = (date) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
};

function feed(events, updated) {
  const stamp = `${(updated || new Date().toISOString()).replace(/[-:]/g, '').slice(0, 15)}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ghost Fees//Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Ghost Fees reminders',
    'X-WR-CALDESC:Subscription reminders from Ghost Fees',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
  ];
  events.forEach((event) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${clean(event.uid, 80)}@ghostfees`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day(event.date)}`,
      `DTEND;VALUE=DATE:${nextDay(event.date)}`,
      `SUMMARY:${ics(event.title)}`,
      `DESCRIPTION:${ics(event.details)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${ics(event.title)}`,
      'TRIGGER:PT9H',
      'END:VALARM',
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const Feeds = base44.asServiceRole.entities.CalendarFeed;

    if (req.method === 'GET') {
      const token = new URL(req.url).searchParams.get('token') || '';
      if (!TOKEN.test(token)) return new Response('Not found', { status: 404 });
      const [found] = await Feeds.filter({ token });
      if (!found) return new Response('Not found', { status: 404 });
      return new Response(feed(found.events || [], found.updated_at), {
        headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-cache' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const token = TOKEN.test(body.token || '') ? body.token : '';
    const [found] = token ? await Feeds.filter({ token }) : [];

    if (body.stop) {
      if (found) await Feeds.delete(found.id);
      return Response.json({ ok: true });
    }

    const events = (Array.isArray(body.events) ? body.events : [])
      .filter((event) => DATE.test(String(event?.date || '')) && clean(event?.title, 100))
      .slice(0, 60)
      .map((event) => ({ uid: clean(event.uid, 80).replace(/[^\w-]/g, '') || crypto.randomUUID(), title: clean(event.title, 100), details: clean(event.details, 300), date: event.date }));
    const updated_at = new Date().toISOString();

    if (found) {
      await Feeds.update(found.id, { events, updated_at });
      return Response.json({ token, count: events.length });
    }
    const fresh = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    await Feeds.create({ token: fresh, events, updated_at });
    return Response.json({ token: fresh, count: events.length });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not save your reminders.' }, { status: 500 });
  }
}
