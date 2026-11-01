import { base44 } from '@/api/base44Client';

// Talks to the backend function `allowance`, which counts the free tier on the
// server. Only a hash of each file's name, size and date leaves the browser,
// never the file. People who aren't signed in get the sample statement, and one
// AI message per ghost and one Cassy lookup counted in this browser.

export const FREE_SCANS = 1;
const LOCAL_KEY = 'ghostFees.freeTier.v1';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function filesPrint(files) {
  return sha256(files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).sort().join('|'));
}

export async function fetchAllowance() {
  const response = await base44.functions.invoke('allowance', { action: 'status' });
  return response?.data || null;
}

// { allowed: true, ticket } or { allowed: false, reason: 'sign_in' | 'limit' }
export async function claimScan(files) {
  const response = await base44.functions.invoke('allowance', { action: 'claimScan', print: await filesPrint(files) });
  return response?.data || { allowed: false, reason: 'error' };
}

export async function startCheckout() {
  const response = await base44.functions.invoke('createCheckout', { origin: window.location.origin });
  const data = response?.data || {};
  if (data.url) {
    window.location.href = data.url;
    return { redirected: true };
  }
  return data;
}

// Browser-only counts for visitors who aren't signed in.
function readLocal() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_KEY) || '{}');
    return { guides: Array.isArray(parsed.guides) ? parsed.guides : [], cass: Array.isArray(parsed.cass) ? parsed.cass : [] };
  } catch {
    return { guides: [], cass: [] };
  }
}

export function localUsage() {
  return readLocal();
}

export function markLocal(kind, value) {
  const state = readLocal();
  const list = state[kind] || [];
  if (list.includes(value)) return state;
  const next = { ...state, [kind]: [...list, value].slice(-20) };
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch {
    // Storage off: nothing to record.
  }
  return next;
}
