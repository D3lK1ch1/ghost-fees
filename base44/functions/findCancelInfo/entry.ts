import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Cassy, the cancel ghost. Looks up one company online and returns how to cancel:
// the official cancel page, the steps, the support phone number and hours, a
// support email or contact page, and the sources it used.
// Only the merchant name is sent here, never statement data. Nothing is stored.

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string', description: 'The company name as the company writes it' },
    found: { type: 'boolean', description: 'false if you could not confidently identify the company' },
    cancelUrl: { type: 'string', description: "Official page on the company's own website where a customer cancels, or '' if not found" },
    steps: { type: 'array', items: { type: 'string' }, description: 'Up to 6 short steps to cancel, in order' },
    phone: { type: 'string', description: "Customer service phone number for Australia, as published by the company, or ''" },
    phoneHours: { type: 'string', description: "When the phone line is open, or ''" },
    email: { type: 'string', description: "Official customer support email address, or ''" },
    supportUrl: { type: 'string', description: "Official contact or help page, or ''" },
    appStoreNote: { type: 'string', description: "If people who signed up in an iPhone or Android app must cancel through Apple or Google, say so in one sentence, else ''" },
    sources: { type: 'array', items: { type: 'string' }, description: 'URLs of the pages you used, official pages first' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['company', 'found', 'cancelUrl', 'steps', 'phone', 'email', 'supportUrl', 'sources', 'confidence'],
};

// ---- Free-tier limits (same block in allowance, parseStatement, askGhostGuide, findCancelInfo) ----
// Only counters and salted one-way hashes are stored, on the Allowance entity.
const FREE_SCANS = 1;
const FREE_CASS = 1; // Cassy looks up one subscription for free
const ANON_DAILY = { guide: 400, cass: 60 }; // ceiling for everyone not signed in, per UTC day
const GUIDE_KEYS = ['penny', 'sir', 'gus', 'cass'];

function secretOr(name, fallback = '') {
  try {
    return secrets.get(name) || fallback;
  } catch {
    return fallback;
  }
}

async function hmac(text) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secretOr('QUOTA_SECRET', 'ghost-fees-unset')), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
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

// Cassy is the most expensive feature (a live web search), so the free tier gets
// one subscription. Asking again about that same one is free. Unlimited once paid.
async function cassGate(base44, merchant) {
  const user = await currentUser(base44);
  if (!user) return (await takeAnonymous(base44, 'cass')) ? { ok: true } : { ok: false, reason: 'busy' };
  const allowance = await loadAllowance(base44, user);
  if (isUnlimited(user, allowance)) return { ok: true };
  const prints = Array.isArray(allowance.cass_prints) ? allowance.cass_prints : [];
  const print = await hmac(`cass:${user.id}:${merchant.toUpperCase()}`);
  if (prints.includes(print)) return { ok: true };
  if (prints.length >= FREE_CASS) return { ok: false, reason: 'limit' };
  return { ok: true, record: () => base44.asServiceRole.entities.Allowance.update(allowance.id, { cass_prints: [...prints, print] }) };
}

const clean = (value, max) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
const url = (value) => {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'https:' ? parsed.toString().slice(0, 300) : '';
  } catch {
    return '';
  }
};
const phone = (value) => (/^[+()\d\s-]{6,24}$/.test(clean(value, 30)) ? clean(value, 30) : '');
const email = (value) => (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(clean(value, 120)) ? clean(value, 120) : '');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    // Strip card numbers, references and locations bank statements add to merchant names.
    const merchant = clean(body.merchant, 60).replace(/\b(CARD|REF|XX)\S*\s*\d*/gi, '').replace(/\d{3,}/g, '').replace(/\s{2,}/g, ' ').trim();
    if (merchant.length < 2) return Response.json({ error: 'Which subscription should I look up?' }, { status: 400 });
    const gate = await cassGate(base44, merchant);
    if (!gate.ok) return Response.json({ locked: true, reason: gate.reason });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are Cassy, the cancel ghost in the Ghost Fees app. An Australian customer wants to cancel "${merchant}" (as it appears on a bank statement; it may be abbreviated).

Search the web and find, from the company's own official website wherever possible:
- the exact page where a customer cancels
- the steps to cancel, short and in order
- the customer service phone number for Australia, and its opening hours
- a customer support email address, or the official contact page
- whether app-store sign-ups must cancel through Apple or Google

Rules:
- Only give links, phone numbers and emails you actually found on the company's official site or an official help centre. Never guess or construct them. Leave a field empty if you did not find it.
- Prefer Australian pages and numbers. Never give a premium-rate or third-party "cancellation service" number.
- If you can't tell which company this is, set found to false and explain nothing else.
- List the URLs you used in sources.
- Set confidence: high only if the cancel page and contact details come from the official site.`,
      add_context_from_internet: true,
      response_json_schema: RESULT_SCHEMA,
    });

    const steps = (Array.isArray(result?.steps) ? result.steps : []).slice(0, 6).map((step) => clean(step, 160)).filter(Boolean);
    const sources = (Array.isArray(result?.sources) ? result.sources : []).map(url).filter(Boolean).slice(0, 4);
    const confidence = ['high', 'medium', 'low'].includes(result?.confidence) ? result.confidence : 'low';
    if (gate.record) await gate.record().catch(() => {});

    return Response.json({
      merchant,
      company: clean(result?.company, 60) || merchant,
      found: Boolean(result?.found) && (Boolean(url(result?.cancelUrl)) || steps.length > 0 || Boolean(phone(result?.phone))),
      cancelUrl: url(result?.cancelUrl),
      steps,
      phone: phone(result?.phone),
      phoneHours: clean(result?.phoneHours, 80),
      email: email(result?.email),
      supportUrl: url(result?.supportUrl),
      appStoreNote: clean(result?.appStoreNote, 200),
      sources,
      confidence,
      checkedAt: new Date().toISOString().slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Cassy could not reach the internet just now.' }, { status: 500 });
  }
}
