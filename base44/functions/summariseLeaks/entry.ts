import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'One plain-English sentence' },
  },
  required: ['summary'],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));

    const total = Math.max(0, Math.min(Number(payload?.total) || 0, 1000000));
    const topMerchant = String(payload?.topMerchant || '').replace(/[\r\n]+/g, ' ').slice(0, 60).trim();
    const topCost = Math.max(0, Math.min(Number(payload?.topCost) || 0, 1000000));
    const count = Math.max(0, Math.min(Math.round(Number(payload?.count) || 0), 500));

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write one plain-English sentence for a young Australian who just scanned their bank statement.

Total yearly leak: $${total.toFixed(0)}
Number of repeating leaks found: ${count}
Biggest single leak: ${topMerchant || 'none'} at $${topCost.toFixed(0)} a year

Rules:
- Exactly one sentence, 30 words maximum.
- Write money as a dollar sign followed by the number, for example $1,817.
- No emojis, no exclamation marks, no financial advice, no markdown.
- Only use the numbers given above. Do not invent merchants,
  products or amounts.`,
      response_json_schema: SUMMARY_SCHEMA,
    });

    const summary = String(result?.summary || '').slice(0, 220).trim();
    if (!summary) return Response.json({ error: 'Could not summarise this scan.' }, { status: 502 });

    return Response.json({ summary });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not summarise this scan.' }, { status: 500 });
  }
}