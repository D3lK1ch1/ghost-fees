import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Counts visits that arrive from the Ghost It agent (?ref=asi1).
// Stores only the day, the ref and how many subscriptions were passed in.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const ref = typeof body.ref === 'string' ? body.ref.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20) : '';
    const subsCount = Math.max(0, Math.min(15, Math.floor(Number(body.subs_count) || 0)));

    if (!ref) return Response.json({ error: 'ref is required' }, { status: 400 });

    await base44.asServiceRole.entities.Analytics.create({
      date: new Date().toISOString().slice(0, 10),
      ref,
      subs_count: subsCount,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
