import { useEffect, useRef, useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import Hero from '@/components/landing/Hero';
import UploadErrors from '@/components/landing/UploadErrors';
import ScanningScreen from '@/components/scan/ScanningScreen';
import ResultsView from '@/components/results/ResultsView';
import { useScan } from '@/lib/ScanContext';
import { trackEvent } from '@/lib/session';

export default function Landing() {
  const { status, steps, progress, transactionCount, fileCount, fileErrors, results, runScan, reset } = useScan();
  const [usedSample, setUsedSample] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    reset();
  }, [reset]);

  const scan = async (files, useSample) => {
    setUsedSample(useSample);
    trackEvent('scan_started');
    const outcome = await runScan({ files, useSample });
    if (outcome) trackEvent('scan_finished');
  };

  const handleFiles = (event) => {
    const picked = Array.from(event.target.files || []).filter((file) => /\.(csv|pdf)$/i.test(file.name));
    event.target.value = '';
    if (picked.length) scan(picked, false);
  };

  if (status === 'scanning') {
    return (
      <ScanningScreen
        steps={steps}
        progress={progress}
        transactionCount={transactionCount}
        fileCount={fileCount}
        onCancel={reset}
      />
    );
  }

  if (status === 'done' && results) {
    return <ResultsView analysis={results} usedSample={usedSample} onRestart={reset} />;
  }

  return (
    <div className="min-h-screen">
      <BrandHeader />
      {fileErrors.length > 0 ? (
        <UploadErrors onSample={() => scan([], true)} />
      ) : (
        <Hero onSample={() => scan([], true)} onUpload={() => inputRef.current?.click()} />
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