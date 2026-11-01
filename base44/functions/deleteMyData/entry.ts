import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// "Delete my data" for signed-in people: removes their free-tier counters
// (Allowance). If they paid, the paid flag goes too, so we ask them to confirm.
// Their sign-in account itself is deleted by us on request (see Privacy).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Sign in first.' }, { status: 401 });

    const rows = await base44.asServiceRole.entities.Allowance.filter({ user_id: user.id });
    const paid = rows.some((row) => row.paid);
    if (paid && body.confirm_paid !== true) return Response.json({ needsConfirm: true });
    await Promise.all(rows.map((row) => base44.asServiceRole.entities.Allowance.delete(row.id)));
    return Response.json({ deleted: rows.length });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not delete your data.' }, { status: 500 });
  }
}
