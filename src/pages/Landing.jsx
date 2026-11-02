import { useCallback, useEffect, useRef, useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import Hero from '@/components/landing/Hero';
import UseCases from '@/components/landing/UseCases';
import StatsStrip from '@/components/stats/StatsStrip';
import CommonSubsChecker from '@/components/landing/CommonSubsChecker';
import FoundersSection from '@/components/landing/FoundersSection';
import UploadErrors from '@/components/landing/UploadErrors';
import SeanceScreen from '@/components/scan/SeanceScreen';
import { CrtOverlay } from '@/components/GhostAnimations';
import ResultsView from '@/components/results/ResultsView';
import SiteFooter from '@/components/site/SiteFooter';
import { useScan } from '@/lib/ScanContext';
import { trackEvent } from '@/lib/session';
import { useAuth } from '@/lib/AuthContext';
import { claimScan } from '@/lib/ghostFees/allowance';
import { useAllowance } from '@/lib/AllowanceContext';
import { useToast } from '@/components/ui/use-toast';
import FromGhostIt from '@/components/landing/FromGhostIt';
import { readGhostItParams } from '@/lib/ghostFees/ghostItLink';
import { base44 } from '@/api/base44Client';

const DEEP_LINK_TABS = ['ghosts', 'house', 'path', 'calendar', 'emails', 'subscriptions', 'receipt', 'feedback'];

export default function Landing() {
  const { status, fileErrors, results, runScan, reset } = useScan();
  const [usedSample, setUsedSample] = useState(false);
  // Coming back from another page (About, Privacy) keeps the scan you already ran.
  const hadResults = useRef(status === 'done' && Boolean(results));
  const [scanDone, setScanDone] = useState(hadResults.current);
  const inputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { openPaywall, refresh, charging } = useAllowance();
  const { toast } = useToast();
  const [ghostIt] = useState(() => readGhostItParams(typeof window !== 'undefined' ? window.location.search : ''));

  // Count visits from the Ghost It agent (ref + how many subs only).
  useEffect(() => {
    if (!ghostIt.ref) return;
    base44.functions.invoke('logRefVisit', { ref: ghostIt.ref, subs_count: ghostIt.subs.length }).catch(() => {});
  }, [ghostIt]);

  // Back from Stripe: ?checkout=cs_... means paid (the server confirms it with Stripe).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;
    params.delete('checkout');
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    if (checkout === 'cancelled') return;
    refresh().then((next) => {
      if (next?.paid) toast({ title: 'Unlocked. Thank you, founding ghost hunter!', description: 'Unlimited scans, ghosts and Cassy are yours, forever.' });
      else toast({ title: 'Payment still processing', description: 'Refresh in a minute. If it doesn’t unlock, email us and we’ll sort it.' });
    });
  }, [refresh, toast]);

  const handleScanDone = useCallback(() => setScanDone(true), []);

  useEffect(() => {
    if (hadResults.current) return;
    reset();
    setScanDone(false);
    // Shareable links like /#house or /#path open the sample straight on that tab.
    if (DEEP_LINK_TABS.includes(window.location.hash.slice(1))) scan([], true);
  }, [reset]);

  const scan = async (files, useSample, ticket = '') => {
    setScanDone(false);
    setUsedSample(useSample);
    trackEvent('scan_started');
    const outcome = await runScan({ files, useSample, ticket });
    if (outcome) trackEvent('scan_finished');
    if (!useSample) refresh();
  };

  // The free scan is counted on the server: sign in, then one upload of up to 6 files.
  // Re-scanning the same files is free. Paid accounts get a ticket every time.
  const handleFiles = async (event) => {
    // Unsupported files go through too, so the error screen can name them.
    const picked = Array.from(event.target.files || []).slice(0, 6);
    event.target.value = '';
    if (!picked.length) return;
    if (charging && !isAuthenticated) {
      openPaywall('sign_in');
      return;
    }
    let claim = null;
    try {
      claim = await claimScan(picked);
    } catch {
      claim = null;
    }
    // Free beta: if the free-scan check can't be reached, scan anyway. CSVs never
    // need the server, and parseStatement skips the ticket while charging is off.
    if (!charging && (!claim || claim.reason === 'error')) {
      scan(picked, false, '');
      return;
    }
    if (!claim) {
      toast({ title: 'Could not check your free scan', description: 'Try again in a moment.' });
      return;
    }
    if (!claim.allowed) {
      openPaywall(claim.reason === 'sign_in' ? 'sign_in' : 'scan');
      return;
    }
    scan(picked, false, claim.ticket);
  };

  const analysisReady = Boolean(status === 'done' && results);
  const scanning = status === 'scanning' || (analysisReady && !scanDone);

  let content;

  if (scanning) {
    content = (
      <SeanceScreen
        lastLine={results && results.leaks.length === 0 ? 'No ghosts found' : 'Ghost detected'}
        leaks={results ? results.leaks : null}
        onDone={handleScanDone}
        onCancel={reset}
      />
    );
  } else if (analysisReady) {
    content = <ResultsView analysis={results} usedSample={usedSample} onRestart={reset} onSample={() => scan([], true)} />;
  } else {
    content = (
    <div className="min-h-screen">
      <BrandHeader />
      {fileErrors.length > 0 ? (
        <UploadErrors errors={fileErrors} onSample={() => scan([], true)} onUpload={() => inputRef.current?.click()} />
      ) : (
        <>
          {ghostIt.subs.length > 0 && <FromGhostIt subs={ghostIt.subs} onScan={() => inputRef.current?.click()} />}
          <Hero onSample={() => scan([], true)} onUpload={() => inputRef.current?.click()} />
          <StatsStrip />
          <CommonSubsChecker onUpload={() => inputRef.current?.click()} onSample={() => scan([], true)} />
          <UseCases />
          <FoundersSection />
          <SiteFooter />
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pdf,text/csv,application/pdf"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
    );
  }

  return (
    <>
      {content}
      <CrtOverlay />
    </>
  );
}