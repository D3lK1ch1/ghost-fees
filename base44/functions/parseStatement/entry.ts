import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const BANK_NAMES = { anz: 'ANZ', commonwealth: 'CommBank', nab: 'NAB' };
const MAX_FILE_BYTES = 5 * 1024 * 1024;

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

// A scan ticket comes from allowance (action claimScan) and lasts 15 minutes.
async function validTicket(base44, ticket) {
  const user = await currentUser(base44);
  const [body, sig] = String(ticket || '').split('.');
  if (!body || !sig || sig !== (await hmac(`ticket:${body}`))) return false;
  try {
    const data = JSON.parse(atob(body));
    if (Number(data.exp) <= Date.now()) return false;
    if (data.u === 'anon') return !chargingOn(); // beta only
    return Boolean(user) && data.u === user.id;
  } catch {
    return false;
  }
}

const TRANSACTION_SCHEMA = {
  type: 'object',
  properties: {
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Transaction date formatted as YYYY-MM-DD' },
          description: {
            type: 'string',
            description: 'The full transaction description or merchant text exactly as printed on the statement',
          },
          amount: {
            type: 'number',
            description: 'Signed amount in Australian dollars. Money out is negative, money in is positive.',
          },
        },
        required: ['date', 'description', 'amount'],
      },
    },
  },
  required: ['transactions'],
};

function normalise(raw) {
  const date = String(raw?.date || '').trim();
  const description = String(raw?.description || '').replace(/\s+/g, ' ').trim();
  const amount = Number(raw?.amount);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!description) return null;
  if (!Number.isFinite(amount) || amount === 0) return null;
  return { date, description: description.slice(0, 200), amount: Math.round(amount * 100) / 100 };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const fileUri = typeof payload?.file_uri === 'string' ? payload.file_uri : '';
    const bank = String(payload?.bank || '');

    if (!fileUri) return Response.json({ error: 'Missing statement file.' }, { status: 400 });
    // Free beta: no ticket needed while charging is off.
    if (chargingOn() && !(await validTicket(base44, payload?.ticket))) {
      return Response.json({ error: 'Sign in and use your free scan, or unlock to scan more.', locked: true });
    }

    const bankName = BANK_NAMES[bank] || 'Australian';
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri,
      expires_in: 120,
    });

    // Same 5 MB limit as the browser. Never log statement contents.
    const head = await fetch(signed_url, { method: 'HEAD', signal: AbortSignal.timeout(10000) }).catch(() => null);
    const size = Number(head?.headers.get('content-length') || 0);
    if (size > MAX_FILE_BYTES) return Response.json({ error: 'This file is over 5 MB. Try exporting a shorter date range.' });
    const type = head?.headers.get('content-type') || '';
    if (type && !/pdf|octet-stream/i.test(type)) return Response.json({ error: "This isn't a PDF." });

    let endpoint = '';
    try {
      endpoint = secrets.get('PARSER_ENDPOINT') || '';
    } catch {
      endpoint = '';
    }

    // Optional: forward the PDF to an external parser (e.g. a Vercel /api/parse-data endpoint).
    if (endpoint) {
      const download = await fetch(signed_url, { signal: AbortSignal.timeout(20000) });
      if (!download.ok) return Response.json({ error: `We couldn't open that ${bankName} statement.` });

      const form = new FormData();
      form.append('FILE', await download.blob(), 'statement.pdf');
      if (bank) form.append('bank', bank);

      const parsed = await fetch(endpoint, { method: 'POST', body: form, signal: AbortSignal.timeout(120000) });
      const json = await parsed.json().catch(() => ({}));
      if (!parsed.ok) {
        return Response.json({ error: json?.error || `The ${bankName} parser could not read this file.` });
      }
      if (json?.error) return Response.json({ error: String(json.error) });

      const rows = Array.isArray(json?.transactions) ? json.transactions.map(normalise).filter(Boolean) : [];
      if (!rows.length) return Response.json({ error: `No transactions found in this ${bankName} statement.` });
      return Response.json({ transactions: rows });
    }

    const extracted = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Extract every transaction from this ${bankName} bank statement, across all pages. date as YYYY-MM-DD (work out the year from the statement period and year headings). description = the merchant or payee text, short, without "EFFECTIVE DATE" text. amount = signed AUD, withdrawals/debits negative, deposits/credits positive. Skip opening balance, closing balance, totals and fee summary rows.`,
      file_urls: [signed_url],
      response_json_schema: TRANSACTION_SCHEMA,
      model: 'gemini_3_flash',
    });

    const rows = Array.isArray(extracted?.transactions) ? extracted.transactions : [];

    const transactions = rows.map(normalise).filter(Boolean);
    if (!transactions.length) return Response.json({ error: `No transactions found in this ${bankName} statement.` });

    return Response.json({ transactions });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not read that statement.' }, { status: 500 });
  }
}