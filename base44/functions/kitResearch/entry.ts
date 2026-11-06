import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Kit's research (6 Nov): for the streaming services someone already pays for, where
// their shows stream in Australia right now, and which of those services is strongest
// for the genres they like. The AI only finds facts with sources. Kit's keep / rotate /
// cancel verdict and every dollar figure are worked out by rules in the app.
// Free tier: counts as Kit's one free AI answer (the same single try as the ghost chat).
// ---- Free-tier limits (same block in allowance, parseStatement, askGhostGuide, findCancelInfo) ----
// Only counters and salted one-way hashes are stored, on the Allowance entity.
const FREE_SCANS = 3; // 3 free statement uploads (one upload = up to 6 files). The sample never counts.
const FREE_CASS = 1; // Cassy looks up one subscription for free
const ANON_DAILY = { guide: 150, cass: 25 }; // ceiling for everyone not signed in, per UTC day
const GUIDE_KEYS = ['penny', 'sir', 'gus', 'cass', 'mind', 'habit', 'bundle'];

function secretOr(name, fallback = '') {
  try {
    return secrets.get(name) || fallback;
  } catch {
    return fallback;
  }
}

// No public fallback: if QUOTA_SECRET isn't set, use a random key made when the function
// starts, so nobody can forge tickets from the code. Set QUOTA_SECRET for stable counts.
const RANDOM_FALLBACK = `${crypto.randomUUID()}${crypto.randomUUID()}`;
async function hmac(text) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode((secretOr('QUOTA_SECRET') || RANDOM_FALLBACK)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

async function currentUser(base44) {
  try {
    return (await base44.auth.me()) || null;
  } catch {
    return null;
  }
}

async function loadAllowance(base44, user) {
  const rows = await base44.asServiceRole.entities.Allowance.filter({ user_id: user.id });
  if (rows?.length) return rows[0];
  return base44.asServiceRole.entities.Allowance.create({ user_id: user.id, scans_used: 0, scan_prints: [], guides_used: [], cass_prints: [], paid: false });
}

// Beta: everything stays free (usage is still counted) until the secret
// PAYMENTS_ENABLED is set to "true". Flip it once enough people have tried it.
const chargingOn = () => secretOr('PAYMENTS_ENABLED') === 'true';
const isUnlimited = (user, allowance) => Boolean(!chargingOn() || user?.role === 'admin' || user?.paid || allowance?.paid);

// Shared daily ceiling for visitors who aren't signed in. Returns false once it's hit.
async function takeAnonymous(base44, kind) {
  const date = new Date().toISOString().slice(0, 10);
  const rows = await base44.asServiceRole.entities.UsageDay.filter({ date, kind });
  const row = rows?.[0];
  const count = Number(row?.count) || 0;
  if (count >= ANON_DAILY[kind]) return false;
  if (row) await base44.asServiceRole.entities.UsageDay.update(row.id, { count: count + 1 });
  else await base44.asServiceRole.entities.UsageDay.create({ date, kind, count: 1 });
  return true;
}
// ---- end free-tier block ----

// ---- Daily AI ceiling (same block in parseStatement, askGhostGuide, findCancelInfo) ----
// Circuit breaker for AI credits: one ceiling per kind per UTC day. Free users
// (signed in or not) share one pool, people who paid share a bigger *_paid pool,
// admins skip it. Paying doesn't buy Base44 credits, so paid can't be unlimited.
// Not isUnlimited(): during the beta that is true for everyone.
const DAILY_AI = { scan: 40, guide_all: 200, cass_all: 30, scan_paid: 300, guide_all_paid: 3000, cass_all_paid: 300 }; // tight during the hackathon (6 Nov)

async function dailyTier(base44) {
  const user = await currentUser(base44);
  if (!user) return 'free';
  if (user.role === 'admin') return 'admin';
  if (user.paid) return 'paid';
  const rows = await base44.asServiceRole.entities.Allowance.filter({ user_id: user.id });
  return rows?.some((row) => row.paid) ? 'paid' : 'free';
}

async function takeDaily(base44, baseKind) {
  const tier = await dailyTier(base44);
  if (tier === 'admin') return true;
  const kind = tier === 'paid' ? `${baseKind}_paid` : baseKind;
  const date = new Date().toISOString().slice(0, 10);
  const rows = await base44.asServiceRole.entities.UsageDay.filter({ date, kind });
  const row = rows?.[0];
  const count = Number(row?.count) || 0;
  if (count >= DAILY_AI[kind]) return false;
  if (row) await base44.asServiceRole.entities.UsageDay.update(row.id, { count: count + 1 });
  else await base44.asServiceRole.entities.UsageDay.create({ date, kind, count: 1 });
  return true;
}
// ---- end daily AI ceiling ----

const FREE_GUIDE_TRIES = 1; // same as askGhostGuide: one free AI answer in total

async function guideGate(base44, guideKey) {
  const user = await currentUser(base44);
  if (!user) return (await takeAnonymous(base44, 'guide')) ? { ok: true } : { ok: false, reason: 'busy' };
  const allowance = await loadAllowance(base44, user);
  const used = Array.isArray(allowance.guides_used) ? allowance.guides_used : [];
  const record = () => base44.asServiceRole.entities.Allowance.update(allowance.id, { guides_used: [...used, guideKey].slice(-50) });
  if (isUnlimited(user, allowance)) return { ok: true, record };
  if (used.length >= FREE_GUIDE_TRIES) return { ok: false, reason: 'limit' };
  return { ok: true, record };
}

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    shows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          service: { type: 'string', description: 'Exactly one name from the services list, or "none"' },
          note: { type: 'string', description: 'Max 12 words, e.g. "all seasons" or "leaving 30 Nov"' },
          source: { type: 'string', description: 'https URL that shows where it streams in Australia' },
        },
        required: ['title', 'service'],
      },
    },
    genres: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          genre: { type: 'string' },
          service: { type: 'string', description: 'The service from the list with the most of this genre, or "none"' },
          why: { type: 'string', description: 'Max 15 words' },
          source: { type: 'string' },
        },
        required: ['genre', 'service'],
      },
    },
  },
  required: ['shows', 'genres'],
};

const clean = (value, max) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
const url = (value) => {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'https:' ? parsed.toString().slice(0, 300) : '';
  } catch {
    return '';
  }
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const services = [...new Set((Array.isArray(body.services) ? body.services : []).map((s) => clean(s, 40)).filter(Boolean))].slice(0, 6);
    const shows = (Array.isArray(body.shows) ? body.shows : []).map((s) => clean(s, 80)).filter(Boolean).slice(0, 5);
    const genres = (Array.isArray(body.genres) ? body.genres : []).map((s) => clean(s, 30)).filter(Boolean).slice(0, 6);
    if (services.length < 2) return Response.json({ error: 'Kit needs at least two services to compare.' }, { status: 400 });
    if (!shows.length && !genres.length) return Response.json({ error: 'Tell Kit a show or a genre you like.' }, { status: 400 });

    const gate = await guideGate(base44, 'bundle');
    if (!gate.ok) return Response.json({ locked: true, reason: gate.reason });
    if (!(await takeDaily(base44, 'cass_all'))) return Response.json({ locked: true, reason: 'busy' });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are Kit, the bundle ghost in the Ghost Fees app. An Australian customer pays for these streaming services: ${JSON.stringify(services)}.

Search the web and find, for Australia, right now:
1. For each show or film in ${JSON.stringify(shows)}: which ONE of their services streams it (included in the subscription, not rent or buy). If more than one does, pick the one with the most seasons. If none of their services has it, use "none".
2. For each genre in ${JSON.stringify(genres)}: which ONE of their services has the most of that genre, and why in a few words.

Rules:
- service must be exactly one of ${JSON.stringify(services)} or "none". Never name or suggest any other service.
- Use Australian availability. Prefer JustWatch Australia (justwatch.com/au) or the service's own Australian page as the source. Give the https URL you used.
- If you are not sure, use "none". Never guess.
- No prices, no advice, no opinions about which to keep.`,
      add_context_from_internet: true,
      response_json_schema: RESULT_SCHEMA,
    });

    const known = new Map(services.map((s) => [String(s).toLowerCase(), String(s)]));
    const pick = (value) => known.get(clean(value, 40).toLowerCase()) || 'none';
    const outShows = shows.map((title) => {
      const hit = (Array.isArray(result?.shows) ? result.shows : []).find((row) => clean(row?.title, 80).toLowerCase() === title.toLowerCase())
        || (Array.isArray(result?.shows) ? result.shows : []).find((row) => clean(row?.title, 80).toLowerCase().includes(title.toLowerCase().slice(0, 6)));
      return { title, service: pick(hit?.service), note: clean(hit?.note, 80), source: url(hit?.source) };
    });
    const outGenres = genres.map((genre) => {
      const hit = (Array.isArray(result?.genres) ? result.genres : []).find((row) => clean(row?.genre, 30).toLowerCase() === genre.toLowerCase());
      return { genre, service: pick(hit?.service), why: clean(hit?.why, 100), source: url(hit?.source) };
    });
    if (gate.record) await gate.record().catch(() => {});
    return Response.json({ shows: outShows, genres: outGenres, checked: new Date().toISOString().slice(0, 10) });
  } catch (error) {
    return Response.json({ error: error?.message || 'Kit could not search right now.' }, { status: 500 });
  }
}
