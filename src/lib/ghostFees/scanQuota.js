// Free scan cap: 1 real scan per browser (one upload, up to 6 files), then sign in and pay.
// The sample statement never counts. Re-scanning the same files is free.
// Only a fingerprint (name, size, date) is kept, never the file contents.
// Note: a browser counter can be reset by clearing storage. A server-side
// check (backend function + Quota entity) is the next step.
const KEY = 'ghostFees.scanQuota.v1';
export const FREE_SCANS = 1;

function read() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    return { scans: Number(parsed.scans) || 0, prints: Array.isArray(parsed.prints) ? parsed.prints : [] };
  } catch {
    return { scans: 0, prints: [] };
  }
}

function fingerprint(files) {
  return files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).sort().join('|');
}

export function scansLeft() {
  return Math.max(0, FREE_SCANS - read().scans);
}

// True if these files may be scanned without paying.
export function canScanFree(files) {
  const state = read();
  return state.prints.includes(fingerprint(files)) || state.scans < FREE_SCANS;
}

export function recordScan(files) {
  const state = read();
  const print = fingerprint(files);
  if (state.prints.includes(print)) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ scans: state.scans + 1, prints: [...state.prints, print].slice(-20) }));
  } catch {
    // Storage off: nothing to record.
  }
}
