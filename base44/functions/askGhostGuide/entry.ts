import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ACTIONS = ['none', 'open_leak', 'draft_email', 'show_transactions', 'open_house', 'scroll_feedback', 'run_sample', 'upload'];

const GUIDES = {
  penny: { name: 'Penny', tone: 'tidy and clear' },
  sir: { name: 'Sir Spooksworth', tone: 'posh and dry' },
  gus: { name: 'Gus', tone: 'hype and upbeat' },
};

const REPLY_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: 'Plain text, 80 words maximum' },
    action: { type: 'string', enum: ACTIONS },
    leakId: { type: 'string', description: 'An id from the summary, only when the action needs one' },
    chips: { type: 'array', items: { type: 'string' }, description: 'Up to 3 short follow-up questions' },
  },
  required: ['reply', 'action'],
};

const clean = (value, max) => String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, max).trim();
const amount = (value) => Math.max(0, Math.min(Number(value) || 0, 1000000));

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const question = clean(body.question, 500);
    if (!question) return Response.json({ error: 'Ask a question first.' }, { status: 400 });

    const guide = GUIDES[body.guide] || GUIDES.penny;
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
    const subscriptions = (Array.isArray(summary.subscriptions) ? summary.subscriptions : []).slice(0, 30).map((item) => ({
      merchant: clean(item?.merchant, 60),
      monthly: amount(item?.monthly),
    }));

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are ${guide.name}, a friendly ghost guide inside the Ghost Fees app. Tone: ${guide.tone}. Tone only; the facts are the same.

Rules:
- You help the user understand their results and use the app: explain what each ghost is, how its amount was worked out, which one costs the most, how to draft a cancel / refund / waive email, how the haunted house works, and that statements are never stored.
- Only use the numbers and merchants in the summary. Never invent merchants, amounts, dates or percentages. Never multiply to yearly figures. If something is not in the summary, say you can't see it.
- Amounts are money already lost in the statement period ("in ${months} months"), not predictions.
- Factual information only. Never recommend or name a bank, card, account, loan, investment, insurer or any financial product. If asked for financial advice (investing, debt, which bank, tax), say you can't give financial advice and suggest moneysmart.gov.au or a licensed financial adviser.
- Off-topic questions: one friendly line steering back to their ghosts.
- Max 80 words, plain text, no markdown, no emojis.
- Pick an action only when it clearly helps (e.g. user asks to write the Netflix email: action 'draft_email' with that leak's id). leakId must be an id from the summary.

Summary of the user's results:
Total: $${amount(summary.total).toFixed(2)} in ${months} months
Leaks: ${JSON.stringify(leaks)}
Subscriptions (not counted in the total): ${JSON.stringify(subscriptions)}

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
    const chips = (Array.isArray(result?.chips) ? result.chips : []).slice(0, 3).map((chip) => clean(chip, 80)).filter(Boolean);

    return Response.json({ reply, action, leakId, chips });
  } catch (error) {
    return Response.json({ error: error?.message || 'The spirits went quiet.' }, { status: 500 });
  }
}
