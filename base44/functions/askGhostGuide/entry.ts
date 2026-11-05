import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const ACTIONS = ['none', 'open_leak', 'draft_email', 'show_transactions', 'open_house', 'scroll_feedback', 'run_sample', 'upload', 'open_pattern', 'open_habit'];

const GUIDES = {
  penny: { name: 'Penny', tone: 'tidy and clear', focus: 'fees and totals: how each amount was worked out and which ghost costs the most' },
  sir: { name: 'Sir Spooksworth', tone: 'posh and dry', focus: 'letters: cancel, refund and fee-waiver emails, and offering to draft them' },
  gus: { name: 'Gus', tone: 'hype and upbeat', focus: 'busting ghosts: what to do first, keeping score and turning savings into goals' },
  cass: { name: 'Cassy', tone: 'calm and practical', focus: 'cancelling: name a subscription and the app looks up its official cancel page, steps and phone number' },
  mind: { name: 'Mo', tone: 'warm and curious, never preachy', focus: 'why money leaks happen: the common pattern behind each ghost and one small habit to beat it' },
  habit: { name: 'Hattie', tone: 'practical, kind, no guilt', focus: 'helps people pick and keep one small money habit from the patterns on their statement' },
};

const REPLY_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: 'Plain text, 80 words maximum' },
    action: { type: 'string', enum: ACTIONS },
    leakId: { type: 'string', description: 'An id from the summary, only when the action needs one' },
    biasKey: { type: 'string', description: 'A pattern key from the summary, only for open_pattern' },
    chips: { type: 'array', items: { type: 'string' }, description: 'Up to 3 short follow-up questions' },
  },
  required: ['reply', 'action'],
};


// ---- Free-tier limits (same block in allowance, parseStatement, askGhostGuide, findCancelInfo) ----
// Only counters and salted one-way hashes are stored, on the Allowance entity.
const FREE_SCANS = 3; // 3 free statement uploads (one upload = up to 6 files). The sample never counts.
const FREE_CASS = 1; // Cassy looks up one subscription for free
const ANON_DAILY = { guide: 400, cass: 60 }; // ceiling for everyone not signed in, per UTC day
const GUIDE_KEYS = ['penny', 'sir', 'gus', 'cass', 'mind', 'habit'];

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

// ---- Daily AI ceiling (same block in parseStatement, askGhostGuide, findCancelInfo) ----
// Circuit breaker for AI credits: one ceiling per kind per UTC day. Free users
// (signed in or not) share one pool, people who paid share a bigger *_paid pool,
// admins skip it. Paying doesn't buy Base44 credits, so paid can't be unlimited.
// Not isUnlimited(): during the beta that is true for everyone.
const DAILY_AI = { scan: 100, guide_all: 1000, cass_all: 100, scan_paid: 300, guide_all_paid: 3000, cass_all_paid: 300 };

async function dailyTier(base44) {
  const user = await currentUser(base44);
  if (!user) return 'free';
  if (user.role === 'admin') return 'admin';
  if (user.paid) return 'paid';
  const rows = await base44.asServiceRole.entities.Allowance.filter({ user_id: user.id });
  return rows?.some((row) => row.paid) ? 'paid' : 'free';
}

async function takeDaily(base44, baseKind) {
  const tier = await dailyTier(base44);
  if (tier === 'admin') return true;
  const kind = tier === 'paid' ? `${baseKind}_paid` : baseKind;
  const date = new Date().toISOString().slice(0, 10);
  const rows = await base44.asServiceRole.entities.UsageDay.filter({ date, kind });
  const row = rows?.[0];
  const count = Number(row?.count) || 0;
  if (count >= DAILY_AI[kind]) return false;
  if (row) await base44.asServiceRole.entities.UsageDay.update(row.id, { count: count + 1 });
  else await base44.asServiceRole.entities.UsageDay.create({ date, kind, count: 1 });
  return true;
}
// ---- end daily AI ceiling ----

// One free ghost guide try in total, on whichever ghost the person picks (Penny,
// Spooksworth, Gus or Cassy); unlimited once paid. Usage is still recorded during
// the free beta, so we have real numbers. Visitors who aren't signed in share a
// daily ceiling (the browser also limits them).
const FREE_GUIDE_TRIES = 1;
async function guideGate(base44, guideKey) {
  const user = await currentUser(base44);
  if (!user) return (await takeAnonymous(base44, 'guide')) ? { ok: true } : { ok: false, reason: 'busy' };
  const allowance = await loadAllowance(base44, user);
  const used = Array.isArray(allowance.guides_used) ? allowance.guides_used : [];
  const record = () => base44.asServiceRole.entities.Allowance.update(allowance.id, { guides_used: [...used, guideKey].slice(-50) });
  if (isUnlimited(user, allowance)) return { ok: true, record };
  if (used.length >= FREE_GUIDE_TRIES) return { ok: false, reason: 'limit' };
  return { ok: true, record };
}

const clean = (value, max) => String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, max).trim();
const amount = (value) => Math.max(0, Math.min(Number(value) || 0, 1000000));

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const question = clean(body.question, 500);
    if (!question) return Response.json({ error: 'Ask a question first.' }, { status: 400 });

    const guideKey = GUIDES[body.guide] ? body.guide : 'penny';
    const guide = GUIDES[guideKey];
    const gate = await guideGate(base44, guideKey);
    if (!gate.ok) return Response.json({ locked: true, reason: gate.reason });
    if (!(await takeDaily(base44, 'guide_all'))) return Response.json({ locked: true, reason: 'busy' });
    const history = (Array.isArray(body.history) ? body.history : [])
      .slice(-6)
      .map((item) => `${item?.role === 'user' ? 'User' : 'Guide'}: ${clean(item?.text, 500)}`)
      .join('\n');

    const summary = body.summary || {};
    const months = Math.max(0, Math.min(Number(summary.months) || 0, 120));
    const leaks = (Array.isArray(summary.leaks) ? summary.leaks : []).slice(0, 30).map((leak) => ({
      id: clean(leak?.id, 80),
      merchant: clean(leak?.merchant, 60),
      badge: clean(leak?.badge, 30),
      amount: amount(leak?.amount),
      monthly: amount(leak?.monthly),
      reason: clean(leak?.reason, 240),
    }));
    // Pack 9: money patterns, computed in the app by biasGroups. The AI explains them only.
    const patterns = (Array.isArray(summary.patterns) ? summary.patterns : []).slice(0, 10).map((p) => ({
      key: clean(p?.key, 40),
      name: clean(p?.name, 40),
      badge: clean(p?.badge, 30),
      total: amount(p?.total),
      charges: Math.max(0, Math.min(Number(p?.charges) || 0, 500)),
      from: clean(p?.from, 10),
      to: clean(p?.to, 10),
      evidence: clean(p?.evidence, 10),
    }));
    const plan = summary.habitPlan && typeof summary.habitPlan === 'object' ? summary.habitPlan : null;
    const habitPlan = plan ? { patternKey: clean(plan.patternKey, 40), habitText: clean(plan.habitText, 200) } : null;
    const rawAnswers = summary.patternAnswers && typeof summary.patternAnswers === 'object' ? summary.patternAnswers : {};
    const patternAnswers = Object.fromEntries(Object.entries(rawAnswers).slice(0, 10).filter(([k, v]) => patterns.some((p) => p.key === k) && ['yes', 'unsure', 'no'].includes(v)));
    const subscriptions = (Array.isArray(summary.subscriptions) ? summary.subscriptions : []).slice(0, 30).map((item) => ({
      merchant: clean(item?.merchant, 60),
      monthly: amount(item?.monthly),
    }));

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are ${guide.name}, a friendly ghost guide inside the Ghost Fees app. Tone: ${guide.tone}. Your speciality is ${guide.focus}; lean your answers and suggestions toward it when it fits. Tone and focus only; the facts are the same.

Rules:
- You help the user understand their results and use the app: explain what each ghost is, how its amount was worked out, which one costs the most, how to draft a cancel / refund / waive email, how the haunted house works, and that statements are never stored.
- Only use the numbers and merchants in the summary. Never invent merchants, amounts, dates or percentages. Never multiply to yearly figures. If something is not in the summary, say you can't see it.
- Amounts are money already lost in the statement period ("in ${months} months"), not predictions.
- Factual information only. Never recommend or name a bank, card, account, loan, investment, insurer or any financial product. If asked for financial advice (investing, debt, which bank, tax), say you can't give financial advice and suggest moneysmart.gov.au or a licensed financial adviser.
- Off-topic questions: one friendly line steering back to their ghosts.
- Max 80 words, plain text, no markdown, no emojis.
- Money patterns: describe each as "a common pattern", never "you have" or a diagnosis. Only patterns listed in the summary, with their totals exactly as given. Never estimate, project or add up a yearly figure: if asked, say you only use what's on their statement. When suggesting a habit, give one, written as "When X, I will Y". If the person answered "no" for a pattern, respect it. To show a pattern's details, use action 'open_pattern' with that pattern's key as biasKey.
${guideKey === 'habit' ? `- You are the habit ghost: help with ONE small habit per answer, written as "When X, I will Y". Max 60 words. Never estimate savings (yearly or otherwise), never diagnose, never name financial products. To open their habit plan, use action 'open_habit' with a pattern key as biasKey.\n` : ''}- Pick an action only when it clearly helps (e.g. user asks to write the Netflix email: action 'draft_email' with that leak's id). leakId must be an id from the summary.

Summary of the user's results:
Total: $${amount(summary.total).toFixed(2)} in ${months} months
Leaks: ${JSON.stringify(leaks)}
Subscriptions (not counted in the total): ${JSON.stringify(subscriptions)}
Money patterns (from the app's maths): ${JSON.stringify(patterns)}
The person said a pattern sounds like them (yes / unsure / no): ${JSON.stringify(patternAnswers)}
Their current habit plan: ${JSON.stringify(habitPlan)}

Recent conversation:
${history || '(none)'}

User: ${question}`,
      response_json_schema: REPLY_SCHEMA,
    });

    const reply = String(result?.reply || '').slice(0, 700).trim();
    if (!reply) return Response.json({ error: 'The spirits went quiet.' }, { status: 502 });

    const leakId = leaks.some((leak) => leak.id === result?.leakId) ? result.leakId : null;
    let action = ACTIONS.includes(result?.action) ? result.action : 'none';
    if (['open_leak', 'draft_email', 'show_transactions'].includes(action) && !leakId) action = 'none';
    const wantsKey = action === 'open_pattern' || action === 'open_habit';
    const biasKey = wantsKey && patterns.some((p) => p.key === result?.biasKey) ? result.biasKey : null;
    if (action === 'open_pattern' && !biasKey) action = 'none';
    const chips = (Array.isArray(result?.chips) ? result.chips : []).slice(0, 3).map((chip) => clean(chip, 80)).filter(Boolean);

    if (gate.record) await gate.record().catch(() => {});
    return Response.json({ reply, action, leakId, biasKey, chips });
  } catch (error) {
    return Response.json({ error: error?.message || 'The spirits went quiet.' }, { status: 500 });
  }
}
