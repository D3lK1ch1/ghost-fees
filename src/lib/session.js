import { base44 } from '@/api/base44Client';

let sessionId = null;

// One anonymous id per browser tab, used to tie events and feedback together.
export function getSessionId() {
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  return sessionId;
}

export function trackEvent(eventType) {
  base44.functions
    .invoke('logEvent', { session_id: getSessionId(), event_type: eventType })
    .catch(() => {});
}