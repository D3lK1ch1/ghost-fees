import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Public scoreboard for /progress. Returns aggregate counts only:
// no names, no emails, no statement data, no free-text feedback.
//
// Also runs the daily clean-up (at most once a UTC day, tracked in Maintenance):
// feedback older than 30 days is anonymised. The name, the free text and the
// most useful leak are cleared; the counts and Yes/Kinda/No answers stay.
const KEEP_DAYS = 30;
const asList = (value) => value?.items || value || [];

async function anonymiseOldFeedback(db, rows) {
  const today = new Date().toISOString().slice(0, 10);
  const mark = asList(await db.Maintenance.filter({ key: 'anonymise_feedback' }).catch(() => []))[0];
  if (mark?.last_run === today) return 0;
  const cutoff = Date.now() - KEEP_DAYS * 86400000;
  const old = rows.filter((row) => {
    const when = Date.parse(row.created_at || row.created_date || '');
    return Number.isFinite(when) && when < cutoff && (row.builder_name || row.confusion_text || row.most_useful_leak);
  });
  for (const row of old) {
    await db.Feedback.update(row.id, { builder_name: '', confusion_text: '', most_useful_leak: '' });
  }
  if (mark) await db.Maintenance.update(mark.id, { last_run: today });
  else await db.Maintenance.create({ key: 'anonymise_feedback', last_run: today });
  return old.length;
}

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
    const rows = asList(feedback);
    // Never let the clean-up break the scoreboard.
    await anonymiseOldFeedback(db, rows).catch(() => 0);
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
