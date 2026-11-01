import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Public scoreboard for /progress. Returns aggregate counts only:
// no names, no emails, no statement data, no free-text feedback.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const [events, feedback, refs] = await Promise.all([
      db.Event.aggregate({ groupBy: 'event_type' }).catch(() => null),
      db.Feedback.list({ limit: 1000 }).catch(() => null),
      db.Analytics.list({ limit: 1000 }).catch(() => null),
    ]);

    const counts = Object.fromEntries((events?.rows || []).map((row) => [row.event_type, row.count]));
    const rows = feedback?.items || feedback || [];
    const real = rows.filter((row) => !row.used_sample);

    return Response.json({
      scans: counts.scan_finished ?? null,
      feedback: rows.length,
      foundSomethingReal: rows.filter((row) => row.found_real === 'Yes' || row.found_real === 'Kinda').length,
      wouldPay: rows.filter((row) => row.would_pay === 'Yes').length,
      foundOnRealStatements: Math.round(real.reduce((sum, row) => sum + (Number(row.yearly_total) || 0), 0)),
      agentVisits: (refs?.items || refs || []).filter((row) => row.ref === 'asi1').length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
