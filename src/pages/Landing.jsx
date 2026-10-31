import { useCallback, useEffect, useRef, useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import Hero from '@/components/landing/Hero';
import UseCases from '@/components/landing/UseCases';
import UploadErrors from '@/components/landing/UploadErrors';
import SeanceScreen from '@/components/scan/SeanceScreen';
import { CrtOverlay } from '@/components/GhostAnimations';
import ResultsView from '@/components/results/ResultsView';
import SiteFooter from '@/components/site/SiteFooter';
import { useScan } from '@/lib/ScanContext';
import { trackEvent } from '@/lib/session';

export default function Landing() {
  const { status, fileErrors, results, runScan, reset } = useScan();
  const [usedSample, setUsedSample] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const inputRef = useRef(null);

  const handleScanDone = useCallback(() => setScanDone(true), []);

  useEffect(() => {
    reset();
    setScanDone(false);
  }, [reset]);

  const scan = async (files, useSample) => {
    setScanDone(false);
    setUsedSample(useSample);
    trackEvent('scan_started');
    const outcome = await runScan({ files, useSample });
    if (outcome) trackEvent('scan_finished');
  };

  const handleFiles = (event) => {
    // Unsupported files go through too, so the error screen can name them.
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    if (picked.length) scan(picked, false);
  };

  const analysisReady = Boolean(status === 'done' && results);
  const scanning = status === 'scanning' || (analysisReady && !scanDone);

  let content;

  if (scanning) {
    content = (
      <SeanceScreen
        lastLine={results && results.leaks.length === 0 ? 'No ghosts found' : 'Ghost detected'}
        onDone={handleScanDone}
        onCancel={reset}
      />
    );
  } else if (analysisReady) {
    content = <ResultsView analysis={results} usedSample={usedSample} onRestart={reset} />;
  } else {
    content = (
    <div className="min-h-screen">
      <BrandHeader right={<span className="text-[13px] font-bold text-muted-foreground">Takes about a minute</span>} />
      {fileErrors.length > 0 ? (
        <UploadErrors errors={fileErrors} onSample={() => scan([], true)} onUpload={() => inputRef.current?.click()} />
      ) : (
        <>
          <Hero onSample={() => scan([], true)} onUpload={() => inputRef.current?.click()} />
          <UseCases />
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