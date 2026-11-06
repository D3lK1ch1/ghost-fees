// "Connect your own AI": a visitor can use their own Claude (Anthropic API) or OpenAI key
// for unlimited ghost answers. The key stays in THIS browser only (session by default,
// this device if they tick "remember") and requests go straight from the browser to
// Anthropic or OpenAI. Ghost Fees and Base44 never see or store the key.
import { GUIDES } from './guides';

const KEY = 'gf_own_ai';
export const PROVIDERS = {
  anthropic: { label: 'Claude (Anthropic)', model: 'claude-opus-5-5', keyHint: 'sk-ant-...', getKey: 'https://console.anthropic.com/settings/keys' },
  openai: { label: 'ChatGPT (OpenAI)', model: '', keyHint: 'sk-...', getKey: 'https://platform.openai.com/api-keys' },
};

export function readOwnAI() {
  try {
    const raw = window.sessionStorage.getItem(KEY) || window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.key && PROVIDERS[parsed.provider] ? parsed : null;
  } catch {
    return null;
  }
}

export function saveOwnAI({ provider, key, model, remember }) {
  const value = JSON.stringify({ provider, key: key.trim(), model: (model || '').trim() || PROVIDERS[provider].model });
  try {
    window.sessionStorage.removeItem(KEY);
    window.localStorage.removeItem(KEY);
    (remember ? window.localStorage : window.sessionStorage).setItem(KEY, value);
  } catch {
    // Storage off: nothing saved.
  }
  window.dispatchEvent(new Event('gf-own-ai'));
}

export function clearOwnAI() {
  try {
    window.sessionStorage.removeItem(KEY);
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('gf-own-ai'));
}

// The same rules the Base44 guide function uses: the ghost's one job, facts from the
// results summary only, no financial advice, a JSON reply the chat can act on.
function systemPrompt(guideKey, summary) {
  const g = GUIDES[guideKey] || GUIDES.penny;
  return `You are ${g.name}, ${g.role}, a ghost guide in the Ghost Fees app (Australia). Your one job: ${g.does}

Rules:
- Only use the numbers and merchants in the summary below. Never invent merchants, amounts, dates or percentages. Never multiply to yearly figures or forecast.
- Factual information only. Never recommend or name a bank, card, account, loan, investment or other financial product. If asked for financial advice, say you can't give it and suggest moneysmart.gov.au.
- If the question is another ghost's job, answer in one short line and set "handoff" to that ghost's key: penny (fees), sir (emails), gus (progress and score), cass (cancelling), bundle (Kit: double-up subscriptions), mind (Mo: money patterns), habit (Hattie: one habit).
- Plain text, max 80 words, no markdown, no emojis, no em dashes.
- Reply with JSON only: {"reply": string, "chips": [up to 3 short follow-up questions], "handoff": one of the keys above or "none"}.

Results summary: ${JSON.stringify(summary)}`;
}

function parseReply(text) {
  const raw = String(text || '').trim();
  const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  try {
    const data = JSON.parse(json);
    if (data && typeof data.reply === 'string') return data;
  } catch {
    // Not JSON: use the text as the reply.
  }
  return { reply: raw.slice(0, 700), chips: [], handoff: 'none' };
}

export async function askOwnAI({ guideKey, question, history = [], summary }) {
  const own = readOwnAI();
  if (!own) throw new Error('no-key');
  const turns = history.slice(-6).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.text || '').slice(0, 1500) })).filter((m) => m.content);
  while (turns.length && turns[0].role !== 'user') turns.shift();
  const messages = [...turns, { role: 'user', content: question }];
  const system = systemPrompt(guideKey, summary);

  // Claude: Anthropic's Messages API, called straight from the browser.
  if (own.provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': own.key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: own.model || PROVIDERS.anthropic.model,
        max_tokens: 2000,
        system,
        messages,
      }),
    });
    if (!res.ok) throw new Error(`anthropic-${res.status}`);
    const data = await res.json();
    if (data?.stop_reason === 'refusal') return { reply: "I can't help with that one. Try asking about your fees or subscriptions.", chips: [], handoff: 'none' };
    const text = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    return parseReply(text);
  }

  // OpenAI: their Chat Completions API, called straight from the browser.
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${own.key}` },
    body: JSON.stringify({ model: own.model, messages: [{ role: 'system', content: system }, ...messages] }),
  });
  if (!res.ok) throw new Error(`openai-${res.status}`);
  const data = await res.json();
  return parseReply(data?.choices?.[0]?.message?.content);
}