import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// The free tier, counted on the server so clearing the browser doesn't reset it.
//   { action: 'status' }                 what's left, whether paid, founding spots left
//   { action: 'claimScan', print }       use (or re-use) the free scan; returns a scan ticket
//   { action: 'export' }                 Download my data: this account's row, labelled
// print = SHA-256 the browser made from each file's name, size and date. It is
// salted and hashed again here before it's kept. File contents never come here.

const FOUNDING_SPOTS = 50;
const PRICES = { founding: 500, standard: 1000 }; // AUD cents
const TICKET_MINUTES = 15;

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

async function foundingLeft(base44) {
  const rows = await base44.asServiceRole.entities.Allowance.filter({ paid: true, tier: 'founding' });
  return Math.max(0, FOUNDING_SPOTS - (rows?.length || 0));
}

// If a checkout was started and not yet confirmed, ask Stripe whether it was paid.
async function confirmCheckout(base44, user, allowance) {
  const key = secretOr('STRIPE_SECRET_KEY');
  if (allowance.paid || !allowance.checkout_id || !key) return allowance;
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(allowance.checkout_id)}`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  const session = response?.ok ? await response.json().catch(() => null) : null;
  if (session?.payment_status !== 'paid' || session?.client_reference_id !== user.id) return allowance;
  const update = { paid: true, paid_at: new Date().toISOString(), amount_cents: Number(session.amount_total) || 0 };
  await base44.asServiceRole.entities.Allowance.update(allowance.id, update);
  return { ...allowance, ...update };
}

async function ticketFor(userId) {
  const body = btoa(JSON.stringify({ u: userId, exp: Date.now() + TICKET_MINUTES * 60000 }));
  return `${body}.${await hmac(`ticket:${body}`)}`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'status');
    const user = await currentUser(base44);
    const spots = await foundingLeft(base44);
    const price = spots > 0 ? PRICES.founding : PRICES.standard;

    if (!user) {
      if (action === 'export') return Response.json({ error: 'Sign in first.' }, { status: 401 });
      // Beta: no sign-in needed to scan. Once charging is on, the free scan needs an account.
      if (action === 'claimScan') {
        return chargingOn() ? Response.json({ allowed: false, reason: 'sign_in' }) : Response.json({ allowed: true, ticket: await ticketFor('anon') });
      }
      return Response.json({ charging: chargingOn(), signedIn: false, paid: !chargingOn(), scansLeft: FREE_SCANS, guidesUsed: [], cassLeft: FREE_CASS, foundingLeft: spots, priceCents: price });
    }

    // Download my data (Privacy page). Doesn't create a row if there isn't one.
    if (action === 'export') {
      const row = (await base44.asServiceRole.entities.Allowance.filter({ user_id: user.id }))?.[0] || null;
      return Response.json({
        exported_at: new Date().toISOString(),
        about: 'Everything Ghost Fees keeps on its server for your account. Statements, transactions, merchant names and results are never kept here. The *_one_way_hashes are scrambled codes that cannot be turned back into file names or company names.',
        account_id: user.id,
        free_tier: row ? {
          scans_used: Number(row.scans_used) || 0,
          scanned_files_one_way_hashes: row.scan_prints || [],
          ghosts_free_message_used: row.guides_used || [],
          cassy_lookup_one_way_hashes: row.cass_prints || [],
        } : null,
        payment: row ? {
          paid: Boolean(row.paid),
          tier: row.tier || null,
          amount_cents_aud: row.amount_cents ?? null,
          paid_at: row.paid_at || null,
          stripe_checkout_session: row.checkout_id || null,
        } : null,
      });
    }

    let allowance = await confirmCheckout(base44, user, await loadAllowance(base44, user));
    const unlimited = isUnlimited(user, allowance);

    if (action === 'claimScan') {
      const raw = String(body.print || '');
      if (!/^[a-f0-9]{64}$/.test(raw)) return Response.json({ error: 'Bad file fingerprint.' }, { status: 400 });
      const print = await hmac(`scan:${user.id}:${raw}`);
      const prints = Array.isArray(allowance.scan_prints) ? allowance.scan_prints : [];
      const used = Number(allowance.scans_used) || 0;
      if (!unlimited && !prints.includes(print)) {
        if (used >= FREE_SCANS) return Response.json({ allowed: false, reason: 'limit', priceCents: price, foundingLeft: spots });
        const update = { scans_used: used + 1, scan_prints: [...prints, print].slice(-20) };
        await base44.asServiceRole.entities.Allowance.update(allowance.id, update);
        allowance = { ...allowance, ...update };
      } else if (unlimited && !prints.includes(print)) {
        await base44.asServiceRole.entities.Allowance.update(allowance.id, { scans_used: used + 1 });
      }
      return Response.json({ allowed: true, ticket: await ticketFor(user.id) });
    }

    return Response.json({
      charging: chargingOn(),
      signedIn: true,
      paid: unlimited,
      scansLeft: unlimited ? null : Math.max(0, FREE_SCANS - (Number(allowance.scans_used) || 0)),
      guidesUsed: unlimited ? [] : (allowance.guides_used || []).filter((key) => GUIDE_KEYS.includes(key)),
      cassLeft: unlimited ? null : Math.max(0, FREE_CASS - (allowance.cass_prints || []).length),
      foundingLeft: spots,
      priceCents: price,
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not check your free scans.' }, { status: 500 });
  }
}
