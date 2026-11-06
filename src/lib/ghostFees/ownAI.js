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

// Key safety:
// - The key is encrypted before it's saved (AES-GCM). The lock is a browser CryptoKey made
//   non-extractable and kept in IndexedDB, so nobody (not even this code) can copy the lock
//   out; storage only ever holds scrambled text plus the last 4 characters for display.
// - The key's shape is checked, then the key is tested against the provider's free
//   model list before it's saved, so only a working key is kept.
// - It's only decrypted at the moment a question is sent, straight to the provider.
const SHAPE = { anthropic: /^sk-ant-[A-Za-z0-9_-]{20,}$/, openai: /^sk-[A-Za-z0-9_-]{20,}$/ };
export const maskKey = (last4) => `••••${last4 || ''}`;

export function keyProblem(provider, key) {
  const k = String(key || '').trim();
  if (!k) return 'Paste your key first.';
  if (/\s/.test(k)) return 'That has a space in it. Copy the key again.';
  if (provider === 'openai' && k.startsWith('sk-ant-')) return 'That looks like a Claude key. Pick Claude instead.';
  if (provider === 'anthropic' && !k.startsWith('sk-ant-')) return 'Claude keys start with sk-ant-. Copy it again.';
  if (!SHAPE[provider].test(k)) return 'That doesn\'t look like a full key. Copy it again.';
  return null;
}

// Test the key with the provider's model list (free, no tokens used).
// Returns 'ok', 'bad' (key refused) or 'unknown' (couldn't reach them).
export async function testKey(provider, key) {
  const k = key.trim();
  try {
    const res = provider === 'anthropic'
      ? await fetch('https://api.anthropic.com/v1/models?limit=1', { headers: { 'x-api-key': k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } })
      : await fetch('https://api.openai.com/v1/models', { headers: { authorization: `Bearer ${k}` } });
    if (res.ok) return 'ok';
    return res.status === 401 || res.status === 403 ? 'bad' : 'unknown';
  } catch {
    return 'unknown';
  }
}

// The lock: one non-extractable AES key per browser, kept in IndexedDB.
function idb() {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open('gf-own-ai', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('lock');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function lock() {
  const db = await idb();
  const get = () => new Promise((resolve, reject) => {
    const r = db.transaction('lock').objectStore('lock').get('k');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  let k = await get();
  if (!k) {
    k = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    await new Promise((resolve, reject) => {
      const tx = db.transaction('lock', 'readwrite');
      tx.objectStore('lock').put(k, 'k');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  return k;
}
const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

function readRaw() {
  try {
    const raw = window.sessionStorage.getItem(KEY) || window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// What the app may show: provider, model and the last 4. Never the key.
export function readOwnAI() {
  const parsed = readRaw();
  if (parsed?.key) { clearOwnAI(false); return null; } // old plain-text save: wipe it
  return parsed?.data && PROVIDERS[parsed.provider] ? { provider: parsed.provider, model: parsed.model, last4: parsed.last4 } : null;
}

async function unlockKey() {
  const parsed = readRaw();
  if (!parsed?.data) return null;
  const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(parsed.iv) }, await lock(), fromB64(parsed.data));
  return new TextDecoder().decode(plain);
}

export async function saveOwnAI({ provider, key, model, remember }) {
  const k = key.trim();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const data = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await lock(), new TextEncoder().encode(k));
  const value = JSON.stringify({ provider, model: (model || '').trim() || PROVIDERS[provider].model, last4: k.slice(-4), iv: toB64(iv), data: toB64(data) });
  try {
    window.sessionStorage.removeItem(KEY);
    window.localStorage.removeItem(KEY);
    (remember ? window.localStorage : window.sessionStorage).setItem(KEY, value);
  } catch {
    // Storage off: nothing saved.
  }
  window.dispatchEvent(new Event('gf-own-ai'));
}

export function clearOwnAI(notify = true) {
  try {
    window.sessionStorage.removeItem(KEY);
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  if (notify) window.dispatchEvent(new Event('gf-own-ai'));
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
  const meta = readOwnAI();
  const key = meta && await unlockKey().catch(() => null);
  if (!meta || !key) throw new Error('no-key');
  const own = { ...meta, key };
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