import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const BANK_NAMES = { anz: 'ANZ', commonwealth: 'CommBank', nab: 'NAB' };

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
    if (!BANK_NAMES[bank]) return Response.json({ error: 'Choose ANZ, CommBank or NAB.' }, { status: 400 });

    const bankName = BANK_NAMES[bank];
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri,
      expires_in: 600,
    });

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
      form.append('bank', bank);

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

    const extracted = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: signed_url,
      json_schema: TRANSACTION_SCHEMA,
    });

    if (extracted?.status === 'error') {
      return Response.json({ error: extracted.details || `We couldn't read this ${bankName} statement.` });
    }

    const rows = Array.isArray(extracted?.output?.transactions)
      ? extracted.output.transactions
      : Array.isArray(extracted?.output)
        ? extracted.output
        : [];

    const transactions = rows.map(normalise).filter(Boolean);
    if (!transactions.length) return Response.json({ error: `No transactions found in this ${bankName} statement.` });

    return Response.json({ transactions });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not read that statement.' }, { status: 500 });
  }
}