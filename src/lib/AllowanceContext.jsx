import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchAllowance, localUsage, markLocal } from '@/lib/ghostFees/allowance';
import Paywall from '@/components/scan/Paywall';
import { trackEvent } from '@/lib/session';

// One place that knows what's free, what's used and whether this person paid.
// The server (allowance, askGhostGuide, findCancelInfo, parseStatement) is the
// real check; this only decides what to show.
const AllowanceContext = createContext(null);

export function AllowanceProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState(null);
  const [local, setLocal] = useState(() => (typeof window === 'undefined' ? { guides: [], cass: [] } : localUsage()));
  const [paywall, setPaywall] = useState(null); // null or a reason: sign_in | scan | guide | cass | report

  const refresh = useCallback(async () => {
    try {
      const next = await fetchAllowance();
      if (next && !next.error) setStatus(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, isAuthenticated, user?.id]);

  // Beta: until PAYMENTS_ENABLED is on, the server says charging: false and everything is free.
  const charging = status?.charging === true;
  const paid = Boolean(user?.role === 'admin' || status?.paid || !charging);
  const signedIn = Boolean(isAuthenticated);
  const guidesUsed = signedIn ? status?.guidesUsed || [] : local.guides;

  const canAskGuide = useCallback((key) => paid || !guidesUsed.includes(key), [paid, guidesUsed]);
  const markGuide = useCallback((key) => {
    if (paid) return;
    if (signedIn) setStatus((current) => (current ? { ...current, guidesUsed: [...new Set([...(current.guidesUsed || []), key])] } : current));
    else setLocal(markLocal('guides', key));
  }, [paid, signedIn]);

  // Cassy: one subscription free. Asking about that same one again stays free.
  const cassUsed = signedIn ? (status?.cassLeft === 0 ? ['*'] : []) : local.cass;
  const canAskCass = useCallback((merchant) => {
    if (paid) return true;
    const name = String(merchant || '').toUpperCase();
    if (!cassUsed.length || cassUsed.includes(name)) return true;
    return false;
  }, [paid, cassUsed]);
  const markCass = useCallback((merchant) => {
    if (paid) return;
    if (signedIn) setStatus((current) => (current ? { ...current, cassLeft: 0 } : current));
    else setLocal(markLocal('cass', String(merchant || '').toUpperCase()));
  }, [paid, signedIn]);

  const openPaywall = useCallback((reason = 'scan') => {
    trackEvent('paywall_shown');
    setPaywall(reason);
  }, []);

  const value = useMemo(() => ({
    status,
    charging,
    paid,
    signedIn,
    priceCents: status?.priceCents || 500,
    foundingLeft: status?.foundingLeft ?? null,
    refresh,
    canAskGuide,
    markGuide,
    canAskCass,
    markCass,
    openPaywall,
  }), [status, charging, paid, signedIn, refresh, canAskGuide, markGuide, canAskCass, markCass, openPaywall]);

  return (
    <AllowanceContext.Provider value={value}>
      {children}
      <Paywall open={Boolean(paywall)} reason={paywall || 'scan'} onClose={() => setPaywall(null)} />
    </AllowanceContext.Provider>
  );
}

export function useAllowance() {
  const context = useContext(AllowanceContext);
  if (!context) throw new Error('useAllowance must be used inside AllowanceProvider');
  return context;
}
