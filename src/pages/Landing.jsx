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
import ValueLine from '@/components/landing/ValueLine';
import HomeTabs from '@/components/landing/HomeTabs';
import IsThisYou from '@/components/landing/IsThisYou';
import PlansAtAGlance from '@/components/landing/PlansAtAGlance';
import GhostTeam from '@/components/landing/GhostTeam';
import { Link } from 'react-router-dom';
import { TRY_RETURN, markTry } from '@/pages/Try';
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
      if (next?.paid) toast({ title: 'Unlocked. Thank you, ghost hunter!', description: 'Unlimited scans, ghosts and Cassy are yours, forever.' });
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
    if (outcome && useSample) trackEvent('sample_finished');
    if (!useSample) refresh();
  };

  // Free scans are counted on the server: sign in, then 3 uploads of up to 6 files each.
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
    // need the server and parseStatement skips the ticket while charging is off.
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
  // Came from /try (step 1): tick it off once results show and offer the way back.
  const [fromTry] = useState(() => {
    try {
      return window.sessionStorage.getItem(TRY_RETURN) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (fromTry && analysisReady) markTry('app');
  }, [fromTry, analysisReady]);
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
          <ValueLine onSample={() => scan([], true)} onUpload={() => inputRef.current?.click()} />
          <Hero onSample={() => scan([], true)} onUpload={() => inputRef.current?.click()} />
          <StatsStrip />
          <GhostTeam />
          {/* Free vs Pro on show, above the tabs, so nobody has to find it (3 Nov). */}
          <section id="plans" aria-label="Free vs Pro" className="mx-auto mt-8 w-full max-w-4xl">
            <p className="text-center text-[13.5px] font-bold uppercase tracking-[0.14em] text-primary">Free vs Pro</p>
            <PlansAtAGlance onSample={() => scan([], true)} />
          </section>
          <HomeTabs tabs={[
            { key: 'you', label: 'Is this you?', content: <IsThisYou /> },
            { key: 'have', label: 'Have any of these?', content: <CommonSubsChecker onUpload={() => inputRef.current?.click()} onSample={() => scan([], true)} /> },
            { key: 'finds', label: 'What it finds', content: <UseCases onUpload={() => inputRef.current?.click()} /> },
            { key: 'who', label: 'Who made it', content: <FoundersSection /> },
          ]} />
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
      {fromTry && analysisReady && (
        <Link to="/try" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#5ee6c8] px-5 py-3 text-[15px] font-extrabold text-[#0f2a24] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)]">
          ← Back to the test (step 1 done)
        </Link>
      )}
      <CrtOverlay />
    </>
  );
}