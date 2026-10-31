import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const FOUND_REAL = ['Yes', 'Kinda', 'No'];
const WOULD_PAY = ['Yes', 'Maybe', 'No'];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const sessionId = typeof body.session_id === 'string' ? body.session_id.trim().slice(0, 64) : '';
    if (!sessionId) return Response.json({ error: 'session_id is required' }, { status: 400 });

    const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
    const number = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
    };

    const foundReal = FOUND_REAL.includes(body.found_real) ? body.found_real : '';
    const wouldPay = WOULD_PAY.includes(body.would_pay) ? body.would_pay : '';
    const createdAt = new Date().toISOString();

    const record = await base44.asServiceRole.entities.Feedback.create({
      session_id: sessionId,
      used_sample: Boolean(body.used_sample),
      leaks_found: number(body.leaks_found),
      yearly_total: number(body.yearly_total),
      found_real: foundReal,
      most_useful_leak: text(body.most_useful_leak, 120),
      confusion_text: text(body.confusion_text, 500),
      would_pay: wouldPay,
      builder_name: text(body.builder_name, 80),
      created_at: createdAt,
    });

    await base44.asServiceRole.entities.Event.create({
      session_id: sessionId,
      event_type: 'feedback_submitted',
      created_at: createdAt,
    });

    return Response.json({ id: record.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}