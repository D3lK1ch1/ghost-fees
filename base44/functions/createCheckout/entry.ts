import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Starts a one-off Stripe Checkout: $5 for the first 50 founding members, then $10.
// Never a subscription. Stripe collects the card; we only keep the session id,
// the tier and, once Stripe says it's paid, paid = true (see allowance).
// Needs secret STRIPE_SECRET_KEY (sk_test_... while testing).

const FOUNDING_SPOTS = 50;
const PRICES = { founding: 500, standard: 1000 };

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

function safeOrigin(value) {
  const fixed = secretOr('APP_URL');
  if (fixed) return fixed.replace(/\/+$/, '');
  try {
    const url = new URL(String(value || ''));
    const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
    if (local || (url.protocol === 'https:' && url.hostname.endsWith('.base44.app'))) return url.origin;
  } catch {
    // fall through
  }
  return 'https://hunt-ghost-fees.base44.app';
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const user = await currentUser(base44);
    if (!user) return Response.json({ error: 'Sign in first, so your unlock stays with your account.' }, { status: 401 });

    const key = secretOr('STRIPE_SECRET_KEY');
    if (!chargingOn()) return Response.json({ error: 'Ghost Fees is free during the beta.' }, { status: 503 });
    if (!key) return Response.json({ error: 'Payments open soon.' }, { status: 503 });

    const allowance = await loadAllowance(base44, user);
    if (isUnlimited(user, allowance)) return Response.json({ alreadyPaid: true });

    const founders = await base44.asServiceRole.entities.Allowance.filter({ paid: true, tier: 'founding' });
    const tier = (founders?.length || 0) < FOUNDING_SPOTS ? 'founding' : 'standard';
    const origin = safeOrigin(body.origin);

    const form = new URLSearchParams({
      mode: 'payment',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'aud',
      'line_items[0][price_data][unit_amount]': String(PRICES[tier]),
      'line_items[0][price_data][product_data][name]': tier === 'founding' ? 'Ghost Fees founding member (once, forever)' : 'Ghost Fees unlock (once, forever)',
      'line_items[0][price_data][product_data][description]': 'Unlimited scans, unlimited ghost chat, Cassy for every subscription and the PDF report. Never a subscription.',
      client_reference_id: user.id,
      'metadata[user_id]': user.id,
      'metadata[tier]': tier,
      success_url: `${origin}/?checkout={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });
    if (user.email) form.set('customer_email', user.email);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: AbortSignal.timeout(15000),
    });
    const session = await response.json().catch(() => ({}));
    if (!response.ok || !session?.url) return Response.json({ error: session?.error?.message || 'Stripe did not start the checkout.' }, { status: 502 });

    await base44.asServiceRole.entities.Allowance.update(allowance.id, { checkout_id: session.id, tier });
    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not start the checkout.' }, { status: 500 });
  }
}
