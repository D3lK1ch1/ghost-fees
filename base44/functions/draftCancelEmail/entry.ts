import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const EMAIL_SCHEMA = {
  type: 'object',
  properties: {
    subject: { type: 'string', description: 'Short email subject line' },
    body: { type: 'string', description: 'Plain text email body' },
  },
  required: ['subject', 'body'],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));

    const merchant = String(payload?.merchant || '').replace(/[\r\n]+/g, ' ').slice(0, 60).trim();
    const amount = Math.abs(Number(payload?.amount) || 0);
    const frequency = String(payload?.frequency || 'monthly').replace(/[^\w\s]/g, '').slice(0, 20).trim();

    if (!merchant) return Response.json({ error: 'Merchant is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a short, polite cancellation email in Australian English.

Business: ${merchant}
Charge: about $${amount.toFixed(2)} ${frequency.toLowerCase()}

Rules:
- Plain text only. No markdown, no emojis, no bullet points.
- 90 words maximum.
- Start with "Hi ${merchant} team,"
- Ask them to cancel the membership or subscription effective today and stop all future charges.
- Ask them to reply confirming the cancellation.
- Write [YOUR MEMBER NUMBER] where an account or member number would go, and sign off as [YOUR NAME].
- Do not invent order numbers, addresses, dates or policies.`,
      response_json_schema: EMAIL_SCHEMA,
    });

    const subject = String(result?.subject || '').slice(0, 120).trim();
    const body = String(result?.body || '').slice(0, 1500).trim();
    if (!subject || !body) return Response.json({ error: 'Could not draft that email.' }, { status: 502 });

    return Response.json({ subject, body });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not draft that email.' }, { status: 500 });
  }
}