import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const EVENT_TYPES = ['scan_started', 'scan_finished', 'cancel_email_clicked', 'feedback_submitted', 'guide_opened', 'guide_message', 'paywall_shown'];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.session_id === 'string' ? body.session_id.trim().slice(0, 64) : '';
    const eventType = typeof body.event_type === 'string' ? body.event_type.trim() : '';

    if (!sessionId) return Response.json({ error: 'session_id is required' }, { status: 400 });
    if (!EVENT_TYPES.includes(eventType)) return Response.json({ error: 'Unknown event_type' }, { status: 400 });

    await base44.asServiceRole.entities.Event.create({
      session_id: sessionId,
      event_type: eventType,
      created_at: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}